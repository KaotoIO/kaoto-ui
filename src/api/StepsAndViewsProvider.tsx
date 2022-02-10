import { IStepProps, IViewData } from '../types';
import { createContext, ReactNode, useContext, useReducer } from 'react';

interface IStepsAndViewsProvider {
  children: ReactNode;
}

type StepsAndViewsAction =
  | { type: 'DELETE_STEP'; payload: { index: number } }
  | { type: 'REPLACE_STEP'; payload: { newStep: IStepProps; oldStepIndex: number } }
  | { type: 'UPDATE_INTEGRATION'; payload: any };

export type IUseStepsAndViews = [
  viewData: IViewData,
  dispatch: (action: StepsAndViewsAction) => void
];

function stepsAndViewsReducer(state: { steps: any[]; views: any[] }, action: StepsAndViewsAction) {
  const { type, payload } = action;

  switch (type) {
    case 'DELETE_STEP': {
      return {
        ...state,
        steps: state.steps.filter((_step: any, idx: any) => idx !== payload.index),
      };
    }
    case 'REPLACE_STEP': {
      let newSteps = state.steps;
      newSteps[payload.oldStepIndex] = payload.newStep;
      return { ...state, steps: newSteps };
    }
    case 'UPDATE_INTEGRATION': {
      return { ...state, ...payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${type}`);
    }
  }
}

export const useStepsAndViews = (): IUseStepsAndViews => {
  const [viewData, dispatch] = useReducer(stepsAndViewsReducer, { steps: [], views: [] });

  // handle from the component directly instead
  // useEffect(() => {
  //   setViewData(newStepsViews);
  // }, [newStepsViews]);

  return [viewData, dispatch];
};

function StepsAndViewsProvider({ children }: IStepsAndViewsProvider) {
  // viewData contains the Step model exactly as returned by the API
  const [viewData, dispatch] = useStepsAndViews();

  return (
    <StepsAndViewsContext.Provider value={[viewData, dispatch]}>
      {children}
    </StepsAndViewsContext.Provider>
  );
}

const StepsAndViewsContext = createContext<IUseStepsAndViews>([
  { steps: [], views: [] },
  () => null,
]);

function useStepsAndViewsContext() {
  const context = useContext(StepsAndViewsContext);
  if (!context) {
    throw new Error('useStepsAndViewsContext must be used within StepsAndViewsProvider!');
  }
  return context;
}

export { StepsAndViewsProvider, useStepsAndViewsContext };
