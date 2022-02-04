import { IViewData } from '../types';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

interface IStepsAndViewsProvider {
  children: ReactNode;
}

export type IUseStepsAndViews = [IViewData, Dispatch<SetStateAction<IViewData>>];

export const useStepsAndViews = ({}: IViewData): IUseStepsAndViews => {
  const [viewData, setViewData] = useState<IViewData>({ steps: [], views: [] });

  // useEffect(() => {
  //   setViewData(newStepsViews);
  // }, [newStepsViews]);

  return [viewData, setViewData];
};

function StepsAndViewsProvider({ children }: IStepsAndViewsProvider) {
  // viewData contains the Step model exactly as returned by the API
  const [viewData, setViewData] = useStepsAndViews(undefined!);

  return (
    <StepsAndViewsContext.Provider value={[viewData, setViewData]}>
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
