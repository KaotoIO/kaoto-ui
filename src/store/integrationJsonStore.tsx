import { useDeploymentStore } from './deploymentStore';
import { useIntegrationSourceStore } from './integrationSourceStore';
import { useNestedStepsStore } from './nestedStepsStore';
import { useSettingsStore } from './settingsStore';
import { useVisualizationStore } from './visualizationStore';
import { extractNestedSteps, regenerateUuids } from '@kaoto/services';
import { IIntegration, IStepProps, IViewProps } from '@kaoto/types';
import { setDeepValue } from '@kaoto/utils';
import isEqual from 'lodash.isequal';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { temporal } from 'zundo';
import create from 'zustand';

interface IIntegrationJsonStore {
  appendStep: (newStep: IStepProps) => void;
  deleteBranchStep: (newStep: IStepProps, originalStepIndex: number) => void;
  deleteIntegration: () => void;
  deleteStep: (index: number) => void;
  deleteSteps: () => void;
  insertStep: (newStep: IStepProps, index: number) => void;
  integrationJson: IIntegration;
  replaceStep: (newStep: IStepProps, oldStepIndex?: number, path?: string[]) => void;
  setViews: (views: IViewProps[]) => void;
  updateIntegration: (newInt?: any) => void;
  views: IViewProps[];
}

const initialState = {
  branchSteps: {},
  integrationJson: {
    metadata: { name: 'integration', dsl: 'KameletBinding', namespace: 'default' },
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

        const stepsWithNewUuids = regenerateUuids(newSteps);
        const { updateSteps } = useNestedStepsStore.getState();
        updateSteps(extractNestedSteps(stepsWithNewUuids));

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
        const stepsWithNewUuids = regenerateUuids(updatedSteps);
        const updateSteps = useNestedStepsStore.getState().updateSteps;
        updateSteps(extractNestedSteps(stepsWithNewUuids));
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
      insertStep: (newStep, currentStepIdx) => {
        let steps = get().integrationJson.steps.slice();

        // unlike appendStep, we need to also regenerate all UUIDs
        // because positions are changing
        const stepsWithNewUuids = regenerateUuids([
          // part of array before the index
          ...steps.slice(0, currentStepIdx),
          // inserted item
          newStep,
          // part of array after the index
          ...steps.slice(currentStepIdx),
        ]);

        const updateSteps = useNestedStepsStore.getState().updateSteps;
        updateSteps(extractNestedSteps(stepsWithNewUuids));

        set((state) => ({
          integrationJson: {
            ...state.integrationJson,
            steps: stepsWithNewUuids,
          },
        }));
      },
      replaceStep: (newStep, oldStepIndex, path) => {
        let newSteps = get().integrationJson.steps.slice();
        if (oldStepIndex === undefined) {
          // replacing a slot step with no pre-existing step
          newSteps.unshift(newStep);
        } else if (path) {
          // replacing a deeply nested step
          newSteps = setDeepValue(newSteps, path, newStep);
        } else {
          // replacing an existing step
          newSteps[oldStepIndex] = newStep;
        }

        const stepsWithNewUuids = regenerateUuids(newSteps);
        const { updateSteps } = useNestedStepsStore.getState();
        updateSteps(extractNestedSteps(stepsWithNewUuids));

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
        const uuidSteps = regenerateUuids(newIntegration.steps);
        const updateSteps = useNestedStepsStore.getState().updateSteps;
        updateSteps(extractNestedSteps(uuidSteps));

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

export const useTemporalIntegrationJsonStore = create(useIntegrationJsonStore.temporal);

export default useIntegrationJsonStore;
