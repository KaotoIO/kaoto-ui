import { IIntegration, IStepProps } from '../types';
import create from 'zustand';

interface IIntegrationJsonStore {
  integrationJson: IIntegration;
  addStep: (newStep: IStepProps) => void;
  deleteIntegration: () => void;
  deleteStep: (index: number) => void;
  replaceStep: (newStep: IStepProps, oldStepIndex: number) => void;
  updateIntegration: (newInt?: any) => void;
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
    set((state) => ({ ...state, steps: [...state.integrationJson.steps, newStep] })),
  deleteIntegration: () => set({ integrationJson: initialIntegration }),
  deleteStep: (stepId) =>
    set((state) => ({
      integrationJson: {
        ...state.integrationJson,
        steps: regenerateUuids(state.integrationJson.steps.filter((_step, idx) => idx !== stepId)),
      },
    })),
  replaceStep: (newStep, oldStepIndex) => {
    let newSteps = get().integrationJson.steps.slice();
    newSteps[oldStepIndex] = newStep;
    return set((state) => ({
      integrationJson: {
        ...state.integrationJson,
        steps: regenerateUuids(newSteps),
      },
    }));
  },
  updateIntegration: (newInt) => {
    let newIntegration = { ...get().integrationJson, ...newInt };
    newIntegration.steps = regenerateUuids(newIntegration.steps);
    return set({ integrationJson: { ...newIntegration } });
  },
}));
