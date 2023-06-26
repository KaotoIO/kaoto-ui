import { ValidationService } from './validationService';
import {
  fetchDeployment,
  fetchStepDetails,
  fetchViews,
  startDeployment,
  stopDeployment,
} from '@kaoto/api';
import {
  useFlowsStore,
  useIntegrationSourceStore,
  useNestedStepsStore,
  useVisualizationStore,
} from '@kaoto/store';
import {
  IIntegration,
  IKaotoApi,
  INestedStep,
  IStepProps,
  IStepPropsBranch,
  IViewProps,
  IStepPropsParameters,
  IVizStepNode,
  IVizStepNodeData,
} from '@kaoto/types';
import { findPath, getDeepValue } from '@kaoto/utils';

/**
 * A collection of business logic to handle logical model objects of the integration,
 * which is represented by a collection of "Step".
 * This class focuses on handling logical model objects. For handling visualization,
 * see {@link VisualizationService}.
 * Note: Methods are declared in alphabetical order.
 * @see IStepProps
 * @see IStepPropsBranch
 */
export class StepsService {

  addBranch(step: IStepProps, branch: IStepPropsBranch) {
    const integrationId = step.integrationId;
    const currentStepNested = this.getStepNested(step.UUID);
    const newStep = { ...step };

    if (!newStep.branches) {
      newStep.branches = [branch];
    } else {
      newStep.branches = newStep.branches.concat(branch);
    }

    if (currentStepNested) {
      useFlowsStore
        .getState()
        .insertStep(integrationId, newStep, { mode: 'replace', path: currentStepNested.pathToStep });
    } else {
      const integration = this.getIntegration(integrationId);
      const currentIdx = this.findStepIdxWithUUID(step.UUID, integration?.steps ?? []);
      useFlowsStore.getState().insertStep(integrationId, newStep, { mode: 'replace', index: currentIdx });
    }
  }

  /**
   * Checks if a Step contains branches
   * @param step
   */
  static containsBranches(step: IStepProps): boolean {
    return Array.isArray(step.branches) && step.branches.length > 0;
  }

  deleteBranch(integrationId: string, step: IStepProps, branchUuid: string) {
    const currentStepNested = this.getStepNested(step.UUID);
    if (currentStepNested) {
      const newParentStep = {
        ...step,
        branches: step.branches?.filter((b) => b.branchUuid !== branchUuid),
      };

      useFlowsStore
        .getState()
        .insertStep(integrationId, newParentStep, { mode: 'replace', path: currentStepNested.pathToStep });
    } else {
      const newStep = {
        ...step,
        branches: step.branches?.filter((b) => b.branchUuid !== branchUuid),
      };

      const integration = this.getIntegration(integrationId);
      const oldStepIdx = this.findStepIdxWithUUID(newStep.UUID, integration?.steps ?? []);
      useFlowsStore.getState().insertStep(integrationId, newStep, { mode: 'replace', index: oldStepIdx });
    }
  }

  /**
   * Creates a {@link IKaotoApi} instance for the target step.
   * @param step target step
   * @param updateStepParams Kaoto save config callback
   * @param alertKaoto Kaoto alert callback
   */
  createKaotoApi(
    step: IStepProps,
    updateStepParams: (values: any) => void,
    alertKaoto: (title: string, body?: string, variant?: string) => void
  ): IKaotoApi {
    let stepParams = {};
    step.parameters?.forEach((parameter) => {
      const paramKey = parameter.id;
      // @ts-ignore
      stepParams[paramKey] = parameter.value ?? parameter.defaultValue;
    });

    return {
      fetchStepDetails,
      getDeployment: async (
        deploymentName: string,
        namespace?: string
      ): Promise<string | unknown> => {
        return fetchDeployment(deploymentName, namespace).then((deployment: string | unknown) => {
          return deployment;
        });
      },
      getIntegrationSource: () => {
        return useIntegrationSourceStore.getState().sourceCode;
      },
      notifyKaoto: alertKaoto,
      startDeployment: async (
        integrationSourceCode: string,
        deploymentName: string,
        namespace?: string
      ): Promise<string> => {
        return startDeployment(integrationSourceCode, deploymentName, namespace).then((res) => {
          return res;
        });
      },
      step,
      stepParams,
      stopDeployment: async (deploymentName: string) => {
        return stopDeployment(deploymentName).then((res) => {
          return res;
        });
      },
      /** TODO: Evaluate if makes sense to keep this duplicated method in the API */
      updateStep: (newStep: IStepProps, newValues?: Record<string, unknown>) => {
        /** TODO: Passing an empty object to avoid setting new parameters to the step */
        this.updateStepParameters(newStep, newValues ?? {});
      },
      updateStepParams,
    };
  }

  deleteStep(integrationId: string, UUID: string): void {
    // check if the step being modified is nested
    const currentStepNested = useNestedStepsStore
      .getState()
      .nestedSteps.find((ns) => ns.stepUuid === UUID);

    if (currentStepNested) {
      const { parentStep, branch } = this.getParentStep(integrationId, currentStepNested);
      if (parentStep === undefined || branch === undefined) return;

      parentStep.branches[currentStepNested.branchIndex].steps = branch.steps.filter(
        (branchStep) => branchStep.UUID !== UUID
      );

      useFlowsStore
        .getState()
        .insertStep(integrationId, parentStep, { mode: 'replace', path: currentStepNested.pathToParentStep });
    } else {
      const integration = this.getIntegration(integrationId);
      const stepsIndex = this.findStepIdxWithUUID(UUID, integration?.steps ?? []);

      useVisualizationStore.getState().deleteNode(stepsIndex);
      useFlowsStore.getState().deleteStep(integrationId, UUID);
    }
  }

  /**
   * Returns a Step index when provided with the `UUID`.
   * `UUID` is originally set using the Step UUID.
   * @param UUID
   * @param steps
   */
  findStepIdxWithUUID(UUID: string, steps: IStepProps[]): number {
    return steps.map((s) => s.UUID).indexOf(UUID);
  }

  /**
   * Returns a Step when provided with the `UUID`, or null if not found.
   * `UUID` is originally set using the Step UUID.
   * @param UUID
   */
  findStepWithUUID(integrationId: string, UUID: string): IStepProps | undefined {
    const integration = this.getIntegration(integrationId);
    if (integration === undefined) return;

    const flatSteps = StepsService.flattenSteps(integration.steps);
    return flatSteps.find((step) => UUID === step.UUID);
  }

  /**
   * Flattens a deeply nested array of Steps and their respective
   * branches, and their Steps, into a single array.
   * Typically used for quickly fetching a Step.
   */
  static flattenSteps(steps: IStepProps[]): IStepProps[] {
    let children: IStepProps[] = [];
    const flattenMembers = steps.map((s) => {
      if (this.supportsBranching(s) && this.containsBranches(s)) {
        s.branches!.forEach((b) => {
          children = [...children, ...b.steps];
        });
      }
      return s;
    });

    return flattenMembers.concat(children.length ? StepsService.flattenSteps(children) : children);
  }

  getFollowingStep(step: IStepProps) {
    if (!step.UUID) return undefined;
    const integration = this.getIntegration(step.integrationId);

    const currentStepIdx = this.findStepIdxWithUUID(step.UUID, integration?.steps ?? []);
    const steps = integration?.steps ?? [];
    return currentStepIdx !== -1 && steps.length > currentStepIdx + 1
      ? steps[currentStepIdx + 1]
      : undefined;
  }

  /**
   * Gets a nested step.
   * @param stepUuid
   */
  getStepNested(stepUuid: string) {
    return useNestedStepsStore.getState().nestedSteps.find((nestedStep) => nestedStep.stepUuid === stepUuid);
  }

  getPreviousStep(step: IStepProps) {
    if (!step.UUID) return undefined;
    const integration = this.getIntegration(step.integrationId);

    const currentStepIdx = this.findStepIdxWithUUID(step.UUID, integration?.steps ?? []);
    const steps = integration?.steps ?? [];
    return currentStepIdx > 0 ? steps[currentStepIdx - 1] : undefined;
  }

  /**
   * Appends a selected step to the current step.
   * @param currentStep
   * @param selectedStep
   */
  async handleAppendStep(currentStep: IStepProps, selectedStep: IStepProps) {
    // fetch parameters and other details
    fetchStepDetails(selectedStep.id).then((newStep) => {
      const integrationId = currentStep.integrationId;

      newStep.UUID = selectedStep.UUID;
      const currentStepNested = this.getStepNested(currentStep.UUID);
      if (currentStepNested) {
        const integration = this.getIntegration(currentStep.integrationId);
        if (integration === undefined) return;

        const stepsCopy = integration?.steps.slice();
        let newParentStep = getDeepValue(stepsCopy, currentStepNested.pathToParentStep);
        const newBranch = newParentStep.branches[currentStepNested.branchIndex];
        newParentStep.branches[currentStepNested.branchIndex].steps = [...newBranch.steps, newStep];

        useFlowsStore
          .getState()
          .insertStep(integrationId, newParentStep, { mode: 'replace', path: currentStepNested.pathToParentStep });
      } else {
        useFlowsStore.getState().insertStep(integrationId, newStep, { mode: 'append' });
      }
    });
  }

  /**
   * Replace an existing step through Drag and Drop.
   * @todo {@link node} is a React Flow related object that should be handled in {@link VisualizationService}, while this does modify the logical step structure. Could we retrieve same info from something else than {@link node}?
   * @param node
   * @param currentStep
   * @param proposedStep
   */
  async handleDropOnExistingStep(
    node: IVizStepNodeData,
    currentStep: IStepProps,
    proposedStep: IStepProps
  ) {
    // fetch parameters and other details
    return fetchStepDetails(proposedStep.id).then((newStep) => {
      const integrationId = node.step.integrationId;

      const validation = ValidationService.canStepBeReplaced(node, newStep);
      // Replace step
      if (validation.isValid) {
        if (node.branchInfo) {
          const currentStepNested = this.getStepNested(currentStep.UUID);
          if (currentStepNested) {
            useFlowsStore
              .getState()
              .insertStep(integrationId, newStep, { mode: 'replace', path: currentStepNested.pathToStep });
          }
        } else {
          const integration = this.getIntegration(integrationId);
          const currentIdx = this.findStepIdxWithUUID(currentStep.UUID, integration?.steps ?? []);
          useFlowsStore.getState().insertStep(integrationId, newStep, { mode: 'replace', index: currentIdx });
        }
      }
      return validation;
    });
  }

  /**
   * Handler for inserting a step, where `targetNode` is the
   * right-hand node. Ex: source -> {insert step here} -> targetNode
   * @param targetNode
   * @param step
   */
  async handleInsertStep(targetNode: IVizStepNode | undefined, step: IStepProps) {
    return fetchStepDetails(step.id).then((newStep) => {
      const integrationId = targetNode?.data.step.integrationId;
      const integration = this.getIntegration(integrationId);

      if (targetNode?.data.branchInfo) {
        const currentStepNested = this.getStepNested(targetNode.data.step.UUID);

        if (currentStepNested) {
          const { parentStep, branch } = this.getParentStep(integrationId, currentStepNested);
          if (parentStep === undefined || branch === undefined) return;

          const newBranch = parentStep.branches[currentStepNested.branchIndex];
          const targetIdx = this.findStepIdxWithUUID(targetNode.data.step.UUID, newBranch.steps);
          parentStep.branches[currentStepNested.branchIndex].steps = StepsService.insertStep(
            newBranch.steps,
            targetIdx,
            newStep
          );

          useFlowsStore
            .getState()
            .insertStep(integrationId, parentStep, { mode: 'replace', path: currentStepNested.pathToParentStep });
        }
      } else {
        const currentIdx = this.findStepIdxWithUUID(targetNode?.data.step.UUID, integration?.steps ?? []);
        useFlowsStore.getState().insertStep(integrationId, newStep, { mode: 'insert', index: currentIdx });
      }
    });
  }

  getIntegration(integrationId: string): IIntegration | undefined {
    return useFlowsStore.getState().flows.find((integration) => integration.id === integrationId);
  }

  /**
   * Prepends a selected step to the current step.
   * @param currentStep
   * @param selectedStep
   */
  async handlePrependStep(integrationId: string, currentStep: IStepProps, selectedStep: IStepProps): Promise<void> {
    // fetch parameters and other details
    fetchStepDetails(selectedStep.id).then((newStep) => {
      newStep.UUID = selectedStep.UUID;
      const currentStepNested = this.getStepNested(currentStep.UUID);

      // special handling for branch steps
      if (currentStepNested) {
        const { parentStep, branch } = this.getParentStep(integrationId, currentStepNested);
        if (parentStep === undefined || branch === undefined) return;

        const currentStepIdx = this.findStepIdxWithUUID(currentStep.UUID, [...branch.steps]);
        parentStep.branches[currentStepNested.branchIndex].steps = StepsService.insertStep(
          [...branch.steps],
          currentStepIdx,
          newStep
        );

        useFlowsStore
          .getState()
          .insertStep(integrationId, parentStep, { mode: 'replace', path: currentStepNested.pathToParentStep });
      } else {
        const integration = this.getIntegration(integrationId);
        const currentIdx = this.findStepIdxWithUUID(currentStep.UUID, integration?.steps ?? []);
        useFlowsStore.getState().insertStep(integrationId, newStep, { mode: 'insert', index: currentIdx });
      }
    });
  }

  /**
   * Insert the given step at the specified index of
   * an array of provided steps
   * @param steps
   * @param insertIndex
   * @param newStep
   */
  static insertStep(steps: IStepProps[], insertIndex: number, newStep: IStepProps): IStepProps[] {
    return [
      // part of array before the index
      ...steps.slice(0, insertIndex),
      // inserted item
      newStep,
      // part of array after the index
      ...steps.slice(insertIndex),
    ];
  }

  static isEndStep(step: IStepProps): boolean {
    return step.type === 'END';
  }

  static isFirstStepEip(steps: IStepProps[]): boolean {
    return steps.length > 0 && steps[0].kind === 'EIP';
  }

  static isFirstStepStart(steps: IStepProps[]): boolean {
    return steps.length > 0 && steps[0].type === 'START';
  }

  static isMiddleStep(step: IStepProps): boolean {
    return step.type === 'MIDDLE';
  }

  static isStartStep(step: IStepProps): boolean {
    return step.type === 'START';
  }

  /**
   * Adds a new step onto a placeholder from mini catalog.
   * @param node
   * @param proposedStep
   */
  async replacePlaceholderStep(node: IVizStepNodeData, proposedStep: IStepProps): Promise<{ isValid: boolean; message?: string }> {
    // fetch parameters and other details
    return fetchStepDetails(proposedStep.id).then((step) => {
      step.UUID = proposedStep.UUID;
      const validation = ValidationService.canStepBeReplaced(node, step);

      if (validation.isValid) {
        // update the steps, the new node will be created automatically
        if (node.branchInfo) {
          if (node.isPlaceholder) {
            const pathToBranch = findPath(
              this.getIntegration(node.step.integrationId)?.steps ?? [],
              node.branchInfo.branchUuid!,
              'branchUuid'
            );
            const newPath = pathToBranch?.concat('steps', '0');

            useFlowsStore.getState().insertStep(node.step.integrationId, step, { mode: 'replace', path: newPath });
          }
        } else {
          useFlowsStore.getState().insertStep(node.step.integrationId, step, { mode: 'insert', index: 0 });
        }
      }

      return validation;
    });
  }

  /**
   * Determines if a given step supports branching at all
   * @param step
   */
  static supportsBranching(step?: IStepProps) {
    if (!step) return false;
    return !!(step.minBranches || step.maxBranches);
  }

  /**
   * Determines if a given step has a custom step extension
   * @param step
   * @param views
   */
  static hasCustomStepExtension(step: IStepProps, views: IViewProps[]): boolean {
    return views.findIndex((view) => view.step === step.UUID && view.url) !== -1;
  }

  /**
   * Update step parameters.
   * @param step
   * @param newValues
   */
  updateStepParameters(step: IStepProps, newValues: Record<string, unknown>) {
    let newStep: IStepProps = step;
    const integrationId = step.integrationId;
    const newStepParameters = newStep.parameters?.slice();

    if (newStepParameters && newStepParameters.length > 0) {
      Object.entries(newValues).forEach(([key, value]) => {
        const paramIndex = newStepParameters.findIndex((p) => p.id === key);
        newStepParameters[paramIndex].value = value;
      });

      // check if the step being modified is nested
      if (useNestedStepsStore.getState().nestedSteps.some((ns) => ns.stepUuid === newStep.UUID)) {
        // use its path to replace only this part of the original step
        const currentStepNested = useNestedStepsStore
          .getState()
          .nestedSteps.find((ns) => ns.stepUuid === newStep.UUID);
        if (currentStepNested) {
          useFlowsStore
            .getState()
            .insertStep(integrationId, newStep, { mode: 'replace', path: currentStepNested.pathToStep });
        }
      } else {
        const integration = this.getIntegration(integrationId);
        const oldStepIdx = this.findStepIdxWithUUID(step.UUID, integration?.steps ?? []);
        useFlowsStore.getState().insertStep(integrationId, newStep, { mode: 'replace', index: oldStepIdx });
      }
    } else {
      return;
    }
  }

  /**
   * Submits current integration steps to the backend and updates with received views.
   */
  async updateViews() {
    const steps = useFlowsStore.getState().flows.reduce((acc, flow) => {
        acc.push(...flow.steps);
        return acc;
      },
      [] as IStepProps[],
    );

    return fetchViews(steps).then((views: IViewProps[]) => {
      if (Array.isArray(views)) {
        useFlowsStore.getState().updateViews(views);
      }
    });
  }

  /**
   * Add records to provided model and the schema for Config views
   * @param parameter config parameter of the step
   * @param modelObjectRef reference to the model object
   * @param schemaObjectRef reference to the schema object
   */
  static buildStepSchemaAndModel(
    parameter: IStepPropsParameters,
    modelObjectRef: IStepPropsParameters,
    schemaObjectRef: {
      [label: string]: {
        type: string;
        defaultValue?: any;
        step?: number;
        value?: any;
        description?: string;
        uniforms?: { placeholder: any };
        label?: string;
      };
    }
  ) {
    const propKey = parameter.id;
    const { type, defaultValue, description, title } = parameter;
    if (type !== 'array' || (type === 'array' && parameter.value && parameter.value.length > 0)) {
      schemaObjectRef[propKey] = {
        type,
        defaultValue,
        description,
        ...(type === "number" || type === "integer") && {step : 1},
        uniforms: { placeholder: defaultValue },
        label: title,
      };
      modelObjectRef[propKey] = parameter.value ?? parameter.defaultValue;
    }
  }

  private getParentStep(integrationId: string, nestedStep: INestedStep): {parentStep: Required<IStepProps> | undefined, branch: IStepPropsBranch | undefined} {
    const stepsCopy = this.getIntegration(integrationId)?.steps ?? [];

    const parentStep = getDeepValue<Required<IStepProps>>(stepsCopy, nestedStep.pathToParentStep);
    const branch = parentStep?.branches?.[nestedStep.branchIndex];

    return { parentStep, branch };
  }
}
