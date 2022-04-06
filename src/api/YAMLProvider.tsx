import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

interface IYAMLDataProvider {
  initialState?: string;
  children: ReactNode;
}

export type IUseYAMLData = [string, Dispatch<SetStateAction<string>>];

/**
 * Provider
 * @param initialState
 * @param children
 * @constructor
 */
function YAMLProvider({ initialState, children }: IYAMLDataProvider) {
  const [YAMLData, setYAMLData] = useState<string>(initialState ?? '');

  return (
    <YAMLDataContext.Provider value={[YAMLData, setYAMLData]}>{children}</YAMLDataContext.Provider>
  );
}

/**
 * Create context
 */
const YAMLDataContext = createContext<IUseYAMLData>(['', () => null]);

/**
 * Convenience hook
 */
function useYAMLContext() {
  const context = useContext(YAMLDataContext);
  if (!context) {
    throw new Error('useYAMLDataContext must be used within YAMLDataProvider!');
  }
  return context;
}

export { YAMLProvider, useYAMLContext };
