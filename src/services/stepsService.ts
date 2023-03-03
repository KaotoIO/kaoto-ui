import { ValidationService } from './validationService';
import {
  fetchDeployment,
  fetchIntegrationSourceCode,
  fetchStepDetails,
  fetchViews,
  startDeployment,
  stopDeployment,
} from '@kaoto/api';
import { IIntegrationJsonStore, INestedStepStore, RFState } from '@kaoto/store';
import {
  IIntegration,
  IKaotoApi,
  INestedStep,
  IStepProps,
  IStepPropsBranch,
  IVizStepNode,
  IVizStepNodeData,
} from '@kaoto/types';
import { findPath, getDeepValue, getRandomArbitraryNumber } from '@kaoto/utils';

/**
 * A collection of business logic to handle logical model objects of the integration,
 * which is represented by a collection of "Step".
 * This class focuses on handling logical model objects. For handling visualization,
 * see {@link VisualizationService}.
 * Note: Methods are declared in alphabetical order.
 * @see IStepProps
 * @see IStepPropsBranch
 * @see VisualizationService
 */
export class StepsService {
  constructor(
    private integrationJsonStore: IIntegrationJsonStore,
    private nestedStepsStore: INestedStepStore,
    private visualizationStore: RFState
  ) {}

  addBranch(step: IStepProps, branch: IStepPropsBranch) {
    const currentStepNested = this.getStepNested(step);
    if (currentStepNested) {
      const newStep = { ...step };
      // if branches array does not exist, create it
      if (!newStep.branches) {
        newStep.branches = [branch];
      } else {
        newStep.branches = newStep.branches.concat(branch);
      }
      this.integrationJsonStore.replaceBranchParentStep(newStep, currentStepNested.pathToStep);
    } else {
      const oldStepIdx = this.findStepIdxWithUUID(
        step.UUID,
        this.integrationJsonStore.integrationJson.steps
      );
      const newStep = { ...step };
      if (!newStep.branches) {
        newStep.branches = [branch];
      } else {
        newStep.branches = newStep.branches.concat(branch);
      }
      this.integrationJsonStore.replaceStep(newStep, oldStepIdx);
    }
  }

  /**
   * Checks if a Step contains branches
   * @param step
   */
  static containsBranches(step: IStepProps): boolean {
    let containsBranching = false;
    if (step.branches && step.branches.length > 0) {
      containsBranching = true;
    }
    return containsBranching;
  }

  deleteBranch(step: IStepProps, branchUuid: string) {
    const currentStepNested = this.getStepNested(step);
    if (currentStepNested) {
      const newStep = {
        ...step,
        branches: step.branches?.filter((b) => b.branchUuid !== branchUuid),
      };
      this.integrationJsonStore.replaceBranchParentStep(newStep, currentStepNested.pathToStep);
    } else {
      const oldStepIdx = this.findStepIdxWithUUID(
        step.UUID,
        this.integrationJsonStore.integrationJson.steps
      );
      const newStep = {
        ...step,
        branches: step.branches?.filter((b) => b.branchUuid !== branchUuid),
      };
      this.integrationJsonStore.replaceStep(newStep, oldStepIdx);
    }
  }

  /**
   * Creates a {@link IKaotoApi} instance for the target step.
   * @param step target step
   * @param saveConfig Kaoto save config callback
   * @param alertKaoto Kaoto alert callback
   */
  createKaotoApi(
    step: IStepProps,
    saveConfig: (values: any) => void,
    alertKaoto: (title: string, body?: string, variant?: string) => void
  ): IKaotoApi {
    let tmpValues = {};
    step.parameters?.map((p) => {
      const paramKey = p.title;
      // @ts-ignore
      tmpValues[paramKey] = p.value ?? p.defaultValue;
    });
    const currentIdx = this.findStepIdxWithUUID(step.UUID);

    return {
      getDeployment: (name: string, namespace?: string): Promise<string | unknown> => {
        return fetchDeployment(name, namespace).then((deployment: string | unknown) => {
          return deployment;
        });
      },
      getIntegrationSource: (integration: IIntegration) => {
        return fetchIntegrationSourceCode(integration).then((sourceCode) => {
          return sourceCode;
        });
      },
      notifyKaoto: alertKaoto,
      startDeployment: (integration: any, name: string, namespace?: string): Promise<string> => {
        return startDeployment(integration, name, namespace).then((res) => {
          return res;
        });
      },
      step,
      stepParams: tmpValues,
      stopDeployment: (name: string) => {
        return stopDeployment(name).then((res) => {
          return res;
        });
      },
      updateStep: (newStep: IStepProps) =>
        this.integrationJsonStore.replaceStep(newStep, currentIdx),
      updateStepParams: saveConfig,
    };
  }

  deleteStep(UUID: string) {
    // check if the step being modified is nested
    const currentStepNested = this.nestedStepsStore.nestedSteps.find((ns) => ns.stepUuid === UUID);
    if (currentStepNested) {
      const stepsCopy = this.integrationJsonStore.integrationJson.steps.slice();
      let newParentStep = getDeepValue(stepsCopy, currentStepNested.pathToParentStep);
      const newBranch = newParentStep.branches[currentStepNested.branchIndex];
      newParentStep.branches[currentStepNested.branchIndex].steps = newBranch.steps.filter(
        (branchStep: { UUID: string }) => branchStep.UUID !== UUID
      );

      this.integrationJsonStore.replaceBranchParentStep(
        newParentStep,
        currentStepNested.pathToParentStep
      );
    } else {
      // `deleteStep` requires the index to be from `integrationJson`, not `nodes`
      const stepsIndex = this.findStepIdxWithUUID(
        UUID,
        this.integrationJsonStore.integrationJson.steps
      );

      this.visualizationStore.deleteNode(stepsIndex);
      this.integrationJsonStore.deleteStep(stepsIndex);
    }
  }

  /**
   * Given an array of Steps, return an array containing *only*
   * the steps which are nested
   * @param steps
   */
  static extractNestedSteps(steps: IStepProps[]) {
    let tempSteps = steps.slice();
    let nestedSteps: INestedStep[] = [];

    const loopOverSteps = (
      steps: IStepProps[],
      parentStepUuid?: string,
      branchUuid?: string,
      branchIdx?: number
    ) => {
      steps.forEach((step) => {
        if (parentStepUuid) {
          // this is a nested step
          nestedSteps.push({
            branchIndex: branchIdx ?? undefined,
            branchUuid,
            stepUuid: step.UUID,
            parentStepUuid,
            pathToBranch: branchUuid ? findPath(tempSteps, branchUuid, 'branchUuid') : undefined,
            pathToParentStep: findPath(tempSteps, parentStepUuid, 'UUID'),
            pathToStep: findPath(tempSteps, step.UUID, 'UUID'),
          } as INestedStep);
        }

        if (this.supportsBranching(step) && this.containsBranches(step)) {
          step.branches!.forEach((branch, branchIdx) => {
            // it contains nested steps; we will need to store the branch info
            // and the path to it, for each of those steps
            return loopOverSteps(branch.steps, step.UUID, branch.branchUuid, branchIdx);
          });
        }
      });
    };

    loopOverSteps(tempSteps);

    return nestedSteps;
  }

  /**
   * Returns a Step index when provided with the `UUID`.
   * `UUID` is originally set using the Step UUID.
   * @param UUID
   * @param steps
   */
  findStepIdxWithUUID(UUID: string, steps?: IStepProps[]): number {
    // optional steps allows for dependency injection in testing,
    // or finding an index within a nested branch's array of steps
    if (!steps) {
      return this.integrationJsonStore.integrationJson.steps.map((s) => s.UUID).indexOf(UUID);
    } else {
      return steps.map((s) => s.UUID).indexOf(UUID);
    }
  }

  /**
   * Returns a Step when provided with the `UUID`, or null if not found.
   * `UUID` is originally set using the Step UUID.
   * @param UUID
   */
  findStepWithUUID(UUID: string): IStepProps | null {
    const flatSteps = StepsService.flattenSteps(this.integrationJsonStore.integrationJson.steps);
    const stepIdx = flatSteps.map((s: IStepProps) => s.UUID).indexOf(UUID);
    return stepIdx !== -1 ? flatSteps[stepIdx] : null;
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

  /**
   * Gets a step nested.
   * @param step
   */
  getStepNested(step: IStepProps) {
    return this.nestedStepsStore.nestedSteps.find((ns) => ns.stepUuid === step.UUID);
  }

  /**
   * Appends a selected step to the current step.
   * @param currentStep
   * @param selectedStep
   */
  handleAppendStep(currentStep: IStepProps, selectedStep: IStepProps) {
    // fetch parameters and other details
    fetchStepDetails(selectedStep.id).then((newStep) => {
      newStep.UUID = selectedStep.UUID;
      const currentStepNested = this.getStepNested(currentStep);
      if (currentStepNested) {
        const stepsCopy = this.integrationJsonStore.integrationJson.steps.slice();
        let newParentStep = getDeepValue(stepsCopy, currentStepNested.pathToParentStep);
        const newBranch = newParentStep.branches[currentStepNested.branchIndex];
        newParentStep.branches[currentStepNested.branchIndex].steps = [...newBranch.steps, newStep];

        this.integrationJsonStore.replaceBranchParentStep(
          newParentStep,
          currentStepNested.pathToParentStep
        );
      } else {
        this.integrationJsonStore.appendStep(newStep);
      }
    });
  }

  /**
   * Replace an existing step through Drag and Drop.
   * @todo {@link node} is a React Flow related object that should be handled in {@link VisualizationService}, while this does modify the logical step structure. Could we retrieve same info from something else than {@link node}?
   * @param node
   * @param currentStep
   * @param stepC
   */
  async handleDropOnExistingStep(
    node: IVizStepNodeData,
    currentStep: IStepProps,
    stepC: IStepProps
  ) {
    // fetch parameters and other details
    return fetchStepDetails(stepC.id).then((newStep) => {
      const validation = ValidationService.canStepBeReplaced(node, newStep);
      // Replace step
      if (validation.isValid) {
        if (node.branchInfo) {
          const currentStepNested = this.getStepNested(currentStep);
          if (currentStepNested) {
            this.integrationJsonStore.replaceBranchParentStep(
              newStep,
              currentStepNested.pathToStep
            );
          }
        } else {
          const currentIdx = this.findStepIdxWithUUID(currentStep.UUID);
          this.integrationJsonStore.replaceStep(newStep, currentIdx);
        }
      }
      return validation;
    });
  }

  /**
   * Handler for inserting a step, where `targetNode` is the
   * right-hand node. Ex: source -> {insert step here} -> target
   * @param targetNode
   * @param newStep
   */
  handleInsertStep(targetNode: IVizStepNode | undefined, step: IStepProps) {
    return fetchStepDetails(step.id).then((newStep) => {
      if (targetNode?.data.branchInfo) {
        const currentStepNested = this.getStepNested(targetNode.data.step);

        if (currentStepNested) {
          const stepsCopy = this.integrationJsonStore.integrationJson.steps.slice();
          let newParentStep = getDeepValue(stepsCopy, currentStepNested.pathToParentStep);
          const newBranch = newParentStep.branches[currentStepNested.branchIndex];
          const targetIdx = this.findStepIdxWithUUID(targetNode.data.step.UUID, newBranch.steps);
          newParentStep.branches[currentStepNested.branchIndex].steps = StepsService.insertStep(
            newBranch.steps,
            targetIdx,
            newStep
          );

          this.integrationJsonStore.replaceBranchParentStep(
            newParentStep,
            currentStepNested.pathToParentStep
          );
        }
      } else {
        const currentIdx = this.findStepIdxWithUUID(targetNode?.data.step.UUID);
        this.integrationJsonStore.insertStep(newStep, currentIdx);
      }
    });
  }

  /**
   * Prepends a selected step to the current step.
   * @param currentStep
   * @param selectedStep
   */
  handlePrependStep(currentStep: IStepProps, selectedStep: IStepProps) {
    // fetch parameters and other details
    fetchStepDetails(selectedStep.id).then((newStep) => {
      newStep.UUID = selectedStep.UUID;
      const currentStepNested = this.getStepNested(currentStep);

      // special handling for branch steps
      if (currentStepNested) {
        const stepsCopy = this.integrationJsonStore.integrationJson.steps.slice();
        let newParentStep = getDeepValue(stepsCopy, currentStepNested.pathToParentStep);
        const newBranch = newParentStep.branches[currentStepNested.branchIndex];
        newParentStep.branches[currentStepNested.branchIndex].steps = StepsService.prependStep(
          [...newBranch.steps],
          newStep
        );

        this.integrationJsonStore.replaceBranchParentStep(
          newParentStep,
          currentStepNested.pathToParentStep
        );
      } else {
        const currentStepIdx = this.findStepIdxWithUUID(currentStep.UUID);
        this.integrationJsonStore.prependStep(currentStepIdx, newStep);
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
   * Inserts the given step at the beginning of the
   * array of provided steps, returning the modified array
   * @param steps
   * @param newStep
   */
  static prependStep(steps: IStepProps[], newStep: IStepProps): IStepProps[] {
    const newSteps = [...steps];
    newSteps.unshift(newStep);
    return newSteps;
  }

  /**
   * Regenerate a UUID for a list of Steps
   * Every time there is a change to steps or their positioning in the Steps array,
   * their UUIDs need to be regenerated
   * @param steps
   * @param branchSteps
   */
  static regenerateUuids(steps: IStepProps[], branchSteps: boolean = false): IStepProps[] {
    let newSteps = steps.slice();

    newSteps.forEach((step, idx) => {
      step.UUID = `${step.name}-${idx}`;
      if (branchSteps) step.UUID = `${step.name}-${idx}-${getRandomArbitraryNumber()}`;
      if (this.containsBranches(step)) {
        step.branches!.forEach((branch) => {
          branch.branchUuid = `b-${idx}-${getRandomArbitraryNumber()}`;
          return newSteps.concat(StepsService.regenerateUuids(branch.steps, true));
        });
      }
    });
    return newSteps;
  }

  /**
   * Adds a new step onto a placeholder from mini catalog.
   * @param node
   * @param stepC
   */
  async replacePlaceholderStep(node: IVizStepNodeData, stepC: IStepProps) {
    // fetch parameters and other details
    return fetchStepDetails(stepC.id).then((step) => {
      step.UUID = stepC.UUID;
      const validation = ValidationService.canStepBeReplaced(node, step);

      if (validation.isValid) {
        // update the steps, the new node will be created automatically
        if (node.branchInfo) {
          if (node.isPlaceholder) {
            const pathToBranch = findPath(
              this.integrationJsonStore.integrationJson.steps,
              node.branchInfo.branchUuid!,
              'branchUuid'
            );
            const newPath = pathToBranch?.concat('steps', '0');
            this.integrationJsonStore.replaceBranchParentStep(step, newPath);
          }
        } else {
          this.integrationJsonStore.replaceStep(step);
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
   * Update step parameters.
   * @param step
   * @param newValues
   */
  updateStepParameters(step: IStepProps, newValues: { [s: string]: unknown } | ArrayLike<unknown>) {
    let newStep: IStepProps = step;
    const newStepParameters = newStep.parameters?.slice();

    if (newStepParameters && newStepParameters.length > 0) {
      Object.entries(newValues).forEach(([key, value]) => {
        const paramIndex = newStepParameters.findIndex((p) => p.id === key);
        newStepParameters[paramIndex].value = value;
      });

      // check if the step being modified is nested
      if (this.nestedStepsStore.nestedSteps.some((ns) => ns.stepUuid === newStep.UUID)) {
        // use its path to replace only this part of the original step
        const currentStepNested = this.nestedStepsStore.nestedSteps.find(
          (ns) => ns.stepUuid === newStep.UUID
        );
        if (currentStepNested) {
          this.integrationJsonStore.replaceBranchParentStep(newStep, currentStepNested.pathToStep);
        }
      } else {
        const oldStepIdx = this.findStepIdxWithUUID(
          newStep.UUID,
          this.integrationJsonStore.integrationJson.steps
        );
        this.integrationJsonStore.replaceStep(newStep, oldStepIdx);
      }
    } else {
      return;
    }
  }

  /**
   * Submits current integration steps to the backend and update with received views.
   */
  updateViews() {
    fetchViews(this.integrationJsonStore.integrationJson.steps).then((views) => {
      this.integrationJsonStore.setViews(views);
    });
  }
}
