import { IStepProps, IViewData } from '../types';
import { createContext, ReactNode, useContext, useReducer } from 'react';

interface IStepsAndViewsProvider {
  children: ReactNode;
  initialState?: IViewData;
}

type StepsAndViewsAction =
  | { type: 'ADD_STEP'; payload: { newStep: IStepProps } }
  | { type: 'DELETE_STEP'; payload: { index: number } }
  | { type: 'REPLACE_STEP'; payload: { newStep: IStepProps; oldStepIndex: number } }
  | { type: 'UPDATE_INTEGRATION'; payload: any };

export type IUseStepsAndViews = [
  viewData: IViewData,
  dispatch: (action: StepsAndViewsAction) => void | IViewData
];

function stepsAndViewsReducer(state: IViewData, action: StepsAndViewsAction) {
  const { type, payload } = action;

  switch (type) {
    case 'ADD_STEP': {
      let newSteps = state.steps;
      newSteps.push(payload.newStep);
      return { ...state, steps: newSteps };
    }
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

export const useStepsAndViews = (initialState?: IViewData): IUseStepsAndViews => {
  const [viewData, dispatch] = useReducer(stepsAndViewsReducer, initialState);

  // handle from the component directly instead
  // useEffect(() => {
  //   setViewData(newStepsViews);
  // }, [newStepsViews]);

  return [viewData, dispatch];
};

function StepsAndViewsProvider({ initialState, children }: IStepsAndViewsProvider) {
  // viewData contains the Step model exactly as returned by the API
  const [viewData, dispatch] = useStepsAndViews(initialState);

  return (
    <StepsAndViewsContext.Provider value={[viewData, dispatch]}>
      {children}
    </StepsAndViewsContext.Provider>
  );
}

const StepsAndViewsContext = createContext<IUseStepsAndViews>([{ steps: [], views: [] }, () => {}]);

function useStepsAndViewsContext() {
  const context = useContext(StepsAndViewsContext);
  if (!context) {
    throw new Error('useStepsAndViewsContext must be used within StepsAndViewsProvider!');
  }
  return context;
}

export { StepsAndViewsProvider, useStepsAndViewsContext };
