import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

interface IStepExtensionApiProvider {
  initialState?: string;
  children: ReactNode;
}

export type IUseStepExtensionApi = [string, Dispatch<SetStateAction<string>>];

/**
 * Provider
 * @param initialState
 * @param children
 * @constructor
 */
function StepExtensionApiProvider({ initialState, children }: IStepExtensionApiProvider) {
  const [StepExtensionApi, setStepExtensionApi] = useState<string>(initialState ?? '');

  return (
    <StepExtensionApiContext.Provider value={[StepExtensionApi, setStepExtensionApi]}>
      {children}
    </StepExtensionApiContext.Provider>
  );
}

/**
 * Create context
 */
const StepExtensionApiContext = createContext<IUseStepExtensionApi>(['', () => null]);

/**
 * Convenience hook
 */
function useStepExtensionApiContext() {
  const context = useContext(StepExtensionApiContext);
  if (!context) {
    throw new Error('useStepExtensionApiContext must be used within StepExtensionApiProvider!');
  }
  return context;
}

export { StepExtensionApiProvider, useStepExtensionApiContext };
