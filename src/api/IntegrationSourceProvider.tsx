import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

interface ISourceCodeProvider {
  initialState?: string;
  children: ReactNode;
}

export type IUseSourceCode = [string, Dispatch<SetStateAction<string>>];

/**
 * Provider
 * @param initialState
 * @param children
 * @constructor
 */
function IntegrationSourceProvider({ initialState, children }: ISourceCodeProvider) {
  const [sourceCode, setSourceCode] = useState<string>(initialState ?? '');

  return (
    <sourceCodeContext.Provider value={[sourceCode, setSourceCode]}>
      {children}
    </sourceCodeContext.Provider>
  );
}

/**
 * Create context
 */
const sourceCodeContext = createContext<IUseSourceCode>(['', () => null]);

/**
 * Convenience hook
 */
function useIntegrationSourceContext() {
  const context = useContext(sourceCodeContext);
  if (!context) {
    throw new Error('useIntegrationSourceContext must be used within SourceCodeProvider!');
  }
  return context;
}

export { IntegrationSourceProvider, useIntegrationSourceContext };
