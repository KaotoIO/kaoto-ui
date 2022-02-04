import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

interface IYAMLDataProvider {
  children: ReactNode;
}

export type IUseYAMLData = [string, Dispatch<SetStateAction<string>>];

export const useYAMLData = (newYAMLData: string): IUseYAMLData => {
  const [YAMLData, setYAMLData] = useState<string>('');

  useEffect(() => {
    setYAMLData(newYAMLData);
  }, [newYAMLData]);

  return [YAMLData, setYAMLData];
};

function YAMLProvider({ children }: IYAMLDataProvider) {
  // viewData contains the Step model exactly as returned by the API
  const [YAMLData, setYAMLData] = useYAMLData('');

  return (
    <YAMLDataContext.Provider value={[YAMLData, setYAMLData]}>{children}</YAMLDataContext.Provider>
  );
}

const YAMLDataContext = createContext<IUseYAMLData>(['', () => null]);

function useYAMLContext() {
  const context = useContext(YAMLDataContext);
  if (!context) {
    throw new Error('useYAMLDataContext must be used within YAMLDataProvider!');
  }
  return context;
}

export { YAMLProvider, useYAMLContext };
