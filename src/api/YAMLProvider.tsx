import { usePrevious } from '../utils';
import { useStepsAndViewsContext } from './StepsAndViewsProvider';
import { fetchViewDefinitions } from './apiService';
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
  initialState?: string;
  children: ReactNode;
}

export type IUseYAMLData = [string | undefined, Dispatch<SetStateAction<string | undefined>>];

export const useYAMLData = (newYAMLData?: string): IUseYAMLData => {
  const [YAMLData, setYAMLData] = useState<string | undefined>(newYAMLData ?? undefined);
  const previousYaml = usePrevious(YAMLData);
  const [, dispatch] = useStepsAndViewsContext();

  useEffect(() => {
    if (previousYaml === YAMLData) {
      return;
    }

    fetchViewDefinitions(YAMLData)
      .then((res) => {
        dispatch({ type: 'UPDATE_INTEGRATION', payload: res });
      })
      .catch((e) => {
        console.error(e);
      });

    setYAMLData(newYAMLData);
  }, [newYAMLData]);

  return [YAMLData, setYAMLData];
};

function YAMLProvider({ initialState, children }: IYAMLDataProvider) {
  const [YAMLData, setYAMLData] = useYAMLData(initialState ?? undefined);

  return (
    <YAMLDataContext.Provider value={[YAMLData, setYAMLData]}>{children}</YAMLDataContext.Provider>
  );
}

const YAMLDataContext = createContext<IUseYAMLData>([undefined, () => null]);

function useYAMLContext() {
  const context = useContext(YAMLDataContext);
  if (!context) {
    throw new Error('useYAMLDataContext must be used within YAMLDataProvider!');
  }
  return context;
}

export { YAMLProvider, useYAMLContext };
