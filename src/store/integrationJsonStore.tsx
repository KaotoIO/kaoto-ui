import { useDeploymentStore } from './deploymentStore';
import { useIntegrationSourceStore } from './integrationSourceStore';
import { useNestedStepsStore } from './nestedStepsStore';
import { initDsl, initialSettings, useSettingsStore } from './settingsStore';
import { useVisualizationStore } from './visualizationStore';
import { StepsService } from '@kaoto/services';
import { IIntegration, IStepProps, IViewProps } from '@kaoto/types';
import { setDeepValue } from '@kaoto/utils';
import isEqual from 'lodash.isequal';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { temporal } from 'zundo';
import { create } from 'zustand';

export interface IIntegrationJsonStore {
  appendStep: (newStep: IStepProps) => void;
  deleteBranchStep: (newStep: IStepProps, originalStepIndex: number) => void;
  deleteIntegration: () => void;
  deleteStep: (index: number) => void;
  deleteSteps: () => void;
  insertStep: (newStep: IStepProps, insertIndex: number) => void;
  integrationJson: IIntegration;
  prependStep: (currentStepIdx: number, newStep: IStepProps) => void;
  replaceBranchParentStep: (newStep: IStepProps, pathToParentStep: string[] | undefined) => void;
  replaceStep: (newStep: IStepProps, oldStepIndex?: number) => void;
  setViews: (views: IViewProps[]) => void;
  updateIntegration: (newInt?: any) => void;
  views: IViewProps[];
}

const initialState = {
  branchSteps: {},
  integrationJson: {
    dsl: initDsl.name,
    metadata: { name: initialSettings.name, namespace: initialSettings.namespace },
    steps: [],
    params: [],
  },
  views: [],
};

export const useIntegrationJsonStore = create<IIntegrationJsonStore>()(
  temporal(
    (set, get) => ({
      ...initialState,
      appendStep: (newStep) => {
        set((state) => {
          let newSteps = state.integrationJson.steps.slice();
          // manually generate UUID for the new step
          newStep.UUID = `${newStep.name}-${newSteps.length}`;
          newSteps.push(newStep);
          return {
            integrationJson: {
              ...state.integrationJson,
              steps: newSteps,
            },
          };
        });
      },
      deleteIntegration: () => set(initialState),
      deleteBranchStep: (newStep: IStepProps, originalStepIndex: number) => {
        let newSteps = get().integrationJson.steps.slice();
        // replacing the origin parent of a deeply nested step
        newSteps[originalStepIndex] = newStep;

        const stepsWithNewUuids = StepsService.regenerateUuids(newSteps);
        const { updateSteps } = useNestedStepsStore.getState();
        updateSteps(StepsService.extractNestedSteps(stepsWithNewUuids));

        return set((state) => ({
          integrationJson: {
            ...state.integrationJson,
            steps: [...stepsWithNewUuids],
          },
        }));
      },
      deleteStep: (stepIdx) => {
        let stepsCopy = get().integrationJson.steps.slice();
        const updatedSteps = stepsCopy.filter((_step: IStepProps, idx: number) => idx !== stepIdx);
        const stepsWithNewUuids = StepsService.regenerateUuids(updatedSteps);
        const updateSteps = useNestedStepsStore.getState().updateSteps;
        updateSteps(StepsService.extractNestedSteps(stepsWithNewUuids));
        set((state) => ({
          integrationJson: {
            ...state.integrationJson,
            steps: stepsWithNewUuids,
          },
        }));
      },
      deleteSteps: () => {
        set((state) => ({
          integrationJson: {
            ...state.integrationJson,
            steps: [],
          },
        }));
      },
      insertStep: (newStep, insertIndex) => {
        let steps = get().integrationJson.steps.slice();
        const stepsWithNewUuids = StepsService.regenerateUuids(
          StepsService.insertStep(steps, insertIndex, newStep)
        );
        const updateSteps = useNestedStepsStore.getState().updateSteps;
        updateSteps(StepsService.extractNestedSteps(stepsWithNewUuids));

        set((state) => ({
          integrationJson: {
            ...state.integrationJson,
            steps: stepsWithNewUuids,
          },
        }));
      },
      prependStep: (currentStepIdx, newStep) => {
        set((state) => {
          return {
            integrationJson: {
              ...state.integrationJson,
              steps: [
                ...state.integrationJson.steps.slice(0, currentStepIdx),
                // manually generate UUID for the new step
                { ...newStep, UUID: `${newStep.name}-${state.integrationJson.steps.length}` },
                ...state.integrationJson.steps.slice(currentStepIdx),
              ],
            },
          };
        });
      },
      replaceBranchParentStep: (newStep, pathToParentStep) => {
        let stepsCopy = get().integrationJson.steps.slice();
        stepsCopy = setDeepValue(stepsCopy, pathToParentStep, newStep);

        const stepsWithNewUuids = StepsService.regenerateUuids(stepsCopy);
        const { updateSteps } = useNestedStepsStore.getState();
        updateSteps(StepsService.extractNestedSteps(stepsWithNewUuids));

        return set((state) => ({
          integrationJson: {
            ...state.integrationJson,
            steps: [...stepsWithNewUuids],
          },
        }));
      },
      replaceStep: (newStep, oldStepIndex) => {
        let stepsCopy = get().integrationJson.steps.slice();
        if (oldStepIndex === undefined) {
          // replacing a slot step with no pre-existing step
          stepsCopy.unshift(newStep);
        } else {
          // replacing an existing step
          stepsCopy[oldStepIndex] = newStep;
        }

        const stepsWithNewUuids = StepsService.regenerateUuids(stepsCopy);
        const { updateSteps } = useNestedStepsStore.getState();
        updateSteps(StepsService.extractNestedSteps(stepsWithNewUuids));

        return set((state) => ({
          integrationJson: {
            ...state.integrationJson,
            steps: [...stepsWithNewUuids],
          },
        }));
      },
      setViews: (viewData: IViewProps[]) => {
        set({ views: viewData });
      },
      updateIntegration: (newInt: IIntegration) => {
        let newIntegration = { ...get().integrationJson, ...newInt };
        const uuidSteps = StepsService.regenerateUuids(newIntegration.steps);
        const updateSteps = useNestedStepsStore.getState().updateSteps;
        updateSteps(StepsService.extractNestedSteps(uuidSteps));

        return set({ integrationJson: { ...newIntegration, steps: uuidSteps } });
      },
    }),
    {
      partialize: (state) => {
        const { integrationJson } = state;
        return { integrationJson };
      },
      equality: (a, b) => isEqual(a, b),
    }
  )
);

if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('integrationJsonStore', useIntegrationJsonStore);
  mountStoreDevtool('integrationSourceStore', useIntegrationSourceStore);
  mountStoreDevtool('nestedStepsStore', useNestedStepsStore);
  mountStoreDevtool('deploymentStore', useDeploymentStore);
  mountStoreDevtool('settingsStore', useSettingsStore);
  mountStoreDevtool('visualizationStore', useVisualizationStore);
}

export default useIntegrationJsonStore;
