import { INestedStep } from '@kaoto/types';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface INestedStepStore {
  addStep: (newStep: INestedStep) => void;
  clearNestedSteps: () => void;
  deleteStep: (stepUuid: string) => void;
  nestedSteps: INestedStep[];
  updateSteps: (newSteps: INestedStep[]) => void;
}

const initialState: INestedStep[] = [];

export const useNestedStepsStore = create<INestedStepStore>()(
  immer((set, get) => ({
    ...initialState,
    addStep: (newStep) => {
      set((state) => {
        let newSteps = state.nestedSteps.slice();
        newSteps.push(newStep);
        return {
          ...state.nestedSteps,
          steps: newSteps,
        };
      });
    },
    clearNestedSteps: () => set({ nestedSteps: initialState }),
    deleteStep: (stepUuid) => {
      let stepsCopy = get().nestedSteps.slice();
      const updatedSteps = stepsCopy.filter((_step: INestedStep) => stepUuid !== _step.stepUuid);
      set((state) => ({
        ...state.nestedSteps,
        steps: updatedSteps,
      }));
    },
    nestedSteps: [],
    updateSteps: (newSteps: INestedStep[]) => {
      return set({ nestedSteps: newSteps });
    },
  }))
);

export default useNestedStepsStore;
