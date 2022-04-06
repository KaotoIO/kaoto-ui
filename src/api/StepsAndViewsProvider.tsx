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

/**
 * Reducer
 * @param state
 * @param action
 */
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

/**
 * Provider
 * @param initialState
 * @param children
 * @constructor
 */
function StepsAndViewsProvider({ initialState, children }: IStepsAndViewsProvider) {
  // viewData contains the Step model exactly as returned by the API
  const [viewData, dispatch] = useReducer(stepsAndViewsReducer, initialState);

  return (
    <StepsAndViewsContext.Provider value={[viewData, dispatch]}>
      {children}
    </StepsAndViewsContext.Provider>
  );
}

/**
 * Create context
 */
const StepsAndViewsContext = createContext<IUseStepsAndViews>([{ steps: [], views: [] }, () => {}]);

/**
 * Convenience hook
 */
function useStepsAndViewsContext() {
  const context = useContext(StepsAndViewsContext);
  if (!context) {
    throw new Error('useStepsAndViewsContext must be used within StepsAndViewsProvider!');
  }
  return context;
}

export { StepsAndViewsProvider, useStepsAndViewsContext };
