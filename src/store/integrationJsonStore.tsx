import { useDeploymentStore } from './deploymentStore';
import { useIntegrationSourceStore } from './integrationSourceStore';
import { useSettingsStore } from './settingsStore';
import { useVisualizationStore } from './visualizationStore';
import { regenerateUuids } from '@kaoto/services';
import { IIntegration, IStepProps, IViewProps } from '@kaoto/types';
import isEqual from 'lodash.isequal';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { temporal } from 'zundo';
import create from 'zustand';

interface IIntegrationJsonStore {
  appendStep: (newStep: IStepProps) => void;
  deleteIntegration: () => void;
  deleteStep: (index: number) => void;
  deleteSteps: () => void;
  insertStep: (newStep: IStepProps, index: number) => void;
  integrationJson: IIntegration;
  replaceStep: (newStep: IStepProps, oldStepIndex?: number) => void;
  setViews: (views: IViewProps[]) => void;
  updateIntegration: (newInt?: any) => void;
  views: IViewProps[];
}

const initialState = {
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
          newStep.UUID = newStep.name + newSteps.length;
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
      deleteStep: (stepIdx) => {
        let stepsCopy = get().integrationJson.steps.slice();
        const updatedSteps = stepsCopy.filter((_step: any, idx: any) => idx !== stepIdx);
        const stepsWithNewUuids = regenerateUuids(updatedSteps);
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
      insertStep: (newStep, idx) => {
        // unlike appendStep, we need to also regenerate all UUIDs
        // because positions are changing
        set((state) => ({
          integrationJson: {
            ...state.integrationJson,
            steps: regenerateUuids([
              // part of array before the index
              ...state.integrationJson.steps.slice(0, idx),
              // inserted item
              newStep,
              // part of array after the index
              ...state.integrationJson.steps.slice(idx),
            ]),
          },
        }));
      },
      replaceStep: (newStep, oldStepIndex) => {
        let newSteps = get().integrationJson.steps.slice();
        if (oldStepIndex === undefined) {
          // replacing a slot step with no pre-existing step
          newSteps.unshift(newStep);
        } else {
          // replacing an existing step
          newSteps[oldStepIndex] = newStep;
        }
        const stepsWithNewUuids = regenerateUuids(newSteps);

        return set((state) => ({
          integrationJson: {
            ...state.integrationJson,
            steps: stepsWithNewUuids,
          },
        }));
      },
      setViews: (viewData: IViewProps[]) => {
        set({ views: viewData });
      },
      updateIntegration: (newInt) => {
        let newIntegration = { ...get().integrationJson, ...newInt };
        newIntegration.steps = regenerateUuids(newIntegration.steps);
        return set({ integrationJson: { ...newIntegration } });
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
  mountStoreDevtool('deploymentStore', useDeploymentStore);
  mountStoreDevtool('settingsStore', useSettingsStore);
  mountStoreDevtool('visualizationStore', useVisualizationStore);
}

export const useTemporalIntegrationJsonStore = create(useIntegrationJsonStore.temporal);

export default useIntegrationJsonStore;
