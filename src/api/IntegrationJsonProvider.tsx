import { IIntegration, IStepProps } from '../types';
import { createContext, ReactNode, useContext, useReducer } from 'react';

interface IIntegrationJsonProvider {
  children: ReactNode;
  initialState?: IIntegration;
}

type IntegrationJsonAction =
  | { type: 'ADD_STEP'; payload: { newStep: IStepProps } }
  | { type: 'DELETE_STEP'; payload: { index: number } }
  | { type: 'REPLACE_STEP'; payload: { newStep: IStepProps; oldStepIndex: number } }
  | { type: 'UPDATE_INTEGRATION'; payload: any };

export type IUseIntegrationJson = [
  integrationJson: IIntegration,
  dispatch: (action: IntegrationJsonAction) => void | IIntegration
];

function regenerateUuids(steps: IStepProps[]) {
  const newSteps = steps.slice();
  newSteps.map((step, idx) => {
    step.UUID = step.name + idx;
  });
  return newSteps;
}

/**
 * Reducer
 * @param state
 * @param action
 */
function integrationJsonReducer(state: IIntegration, action: IntegrationJsonAction) {
  const { type, payload } = action;

  switch (type) {
    case 'ADD_STEP': {
      let newSteps = state.steps.slice();
      payload.newStep.UUID = payload.newStep.name + state.steps.length;
      newSteps.push(payload.newStep);
      return { ...state, steps: newSteps };
    }
    case 'DELETE_STEP': {
      let stepsCopy = state.steps.slice();
      const updatedSteps = stepsCopy.filter((_step: any, idx: any) => idx !== payload.index);
      const stepsWithNewUuids = regenerateUuids(updatedSteps);
      return {
        ...state,
        steps: stepsWithNewUuids,
      };
    }
    case 'REPLACE_STEP': {
      let newSteps = state.steps.slice();
      newSteps[payload.oldStepIndex] = payload.newStep;
      const stepsWithNewUuids = regenerateUuids(newSteps);
      return { ...state, steps: stepsWithNewUuids };
    }
    case 'UPDATE_INTEGRATION': {
      let newIntegration = { ...state, ...payload };
      newIntegration.steps = regenerateUuids(newIntegration.steps);
      return { ...newIntegration };
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
function IntegrationJsonProvider({ initialState, children }: IIntegrationJsonProvider) {
  // integrationJson contains the steps, metadata, params of an integration
  const [integrationJson, dispatch] = useReducer(integrationJsonReducer, initialState);

  return (
    <IntegrationJsonContext.Provider value={[integrationJson, dispatch]}>
      {children}
    </IntegrationJsonContext.Provider>
  );
}

/**
 * Create context
 */
const IntegrationJsonContext = createContext<IUseIntegrationJson>([
  { metadata: { name: '' }, steps: [], params: [] },
  () => {},
]);

/**
 * Convenience hook
 */
function useIntegrationJsonContext() {
  const context = useContext(IntegrationJsonContext);
  if (!context) {
    throw new Error('useStepsAndViewsContext must be used within StepsAndViewsProvider!');
  }
  return context;
}

export { IntegrationJsonProvider, useIntegrationJsonContext };
