import { IIntegration, IStepProps, IViewProps } from '../types';
import { useDeploymentStore } from './deploymentStore';
import { useIntegrationSourceStore } from './integrationSourceStore';
import { useSettingsStore } from './settingsStore';
import { useVisualizationStore } from './visualizationStore';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import create from 'zustand';

interface IIntegrationJsonStore {
  addStep: (newStep: IStepProps) => void;
  deleteIntegration: () => void;
  deleteStep: (index: number) => void;
  integrationJson: IIntegration;
  updateIntegration: (newInt?: any) => void;
  replaceStep: (newStep: IStepProps, oldStepIndex?: number) => void;
  setViews: (views: IViewProps[]) => void;
  views: IViewProps[];
}

const initialIntegration: IIntegration = {
  metadata: { name: 'integration', dsl: 'KameletBinding', namespace: 'default' },
  steps: [],
  params: [],
};

/**
 * Regenerate a UUID for a list of Steps
 * Every time there is a change to steps or their positioning in the Steps array,
 * their UUIDs need to be regenerated
 * @param steps
 */
function regenerateUuids(steps: IStepProps[]) {
  const newSteps = steps.slice();
  newSteps.map((step, idx) => {
    step.UUID = step.name + idx;
  });
  return newSteps;
}

export const useIntegrationJsonStore = create<IIntegrationJsonStore>((set, get) => ({
  integrationJson: initialIntegration,
  addStep: (newStep) =>
    set((state) => {
      return {
        integrationJson: {
          ...state.integrationJson,
          steps: regenerateUuids([...state.integrationJson.steps, newStep]),
        },
      };
    }),
  deleteIntegration: () => set({ integrationJson: initialIntegration }),
  deleteStep: (stepId) =>
    set((state) => ({
      integrationJson: {
        ...state.integrationJson,
        steps: regenerateUuids(state.integrationJson.steps.filter((_step, idx) => idx !== stepId)),
      },
    })),
  replaceStep: (newStep, oldStepIndex?) => {
    let newSteps = get().integrationJson.steps.slice();
    if (!oldStepIndex) {
      // replacing a slot step with no pre-existing step
      newSteps.unshift(newStep);
    } else {
      // replacing an existing step
      newSteps[oldStepIndex] = newStep;
    }
    return set((state) => ({
      integrationJson: {
        ...state.integrationJson,
        steps: regenerateUuids(newSteps),
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
  views: [],
}));

if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('integrationJsonStore', useIntegrationJsonStore);
  mountStoreDevtool('integrationSourceStore', useIntegrationSourceStore);
  mountStoreDevtool('deploymentStore', useDeploymentStore);
  mountStoreDevtool('settingsStore', useSettingsStore);
  mountStoreDevtool('visualizationStore', useVisualizationStore);
}
