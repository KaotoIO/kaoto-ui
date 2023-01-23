import { INestedStep } from '@kaoto/types';
import { create } from 'zustand';

interface INestedStepStore {
  addStep: (newStep: INestedStep) => void;
  clearNestedSteps: () => void;
  deleteStep: (stepUuid: string) => void;
  nestedSteps: INestedStep[];
  updateSteps: (newSteps: INestedStep[]) => void;
}

const initialState: INestedStep[] = [];

export const useNestedStepsStore = create<INestedStepStore>()((set, get) => ({
  ...initialState,
  addStep: (newStep) => {
    set((state) => {
      let newSteps = state.nestedSteps.slice();
      newSteps.push(newStep);
      return {
        nestedSteps: newSteps,
      };
    });
  },
  clearNestedSteps: () => set({ nestedSteps: initialState }),
  deleteStep: (stepUuid) => {
    let stepsCopy = get().nestedSteps.slice();
    const updatedSteps = stepsCopy.filter((_step: INestedStep) => stepUuid !== _step.stepUuid);
    set({ nestedSteps: updatedSteps });
  },
  nestedSteps: [],
  updateSteps: (newSteps: INestedStep[]) => {
    return set({ nestedSteps: newSteps });
  },
}));

export default useNestedStepsStore;
