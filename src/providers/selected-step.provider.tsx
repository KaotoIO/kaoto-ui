import { VisualizationService } from '../services';
import { IStepProps } from '../types';
import {
  FunctionComponent,
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';

export interface ISelectedStep {
  editStep: (selectedStep: IStepProps | undefined) => void;
  isPanelExpanded: boolean;
  selectedStep: IStepProps;
}

export const SelectedStep = createContext<ISelectedStep>({} as ISelectedStep);

export const SelectedStepProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [selectedStep, setSelectedStep] = useState<IStepProps>(
    VisualizationService.getEmptySelectedStep(),
  );
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const editStep = useCallback((step: IStepProps | undefined) => {
    if (!step) {
      setSelectedStep(VisualizationService.getEmptySelectedStep());
      setIsPanelExpanded(false);
      return;
    }

    setSelectedStep(step);
    setIsPanelExpanded(true);
  }, []);

  const selectedStepProviderValue: ISelectedStep = useMemo(
    () => ({ editStep, isPanelExpanded, selectedStep }),
    [editStep, isPanelExpanded, selectedStep],
  );

  return (
    <SelectedStep.Provider value={selectedStepProviderValue}>{children}</SelectedStep.Provider>
  );
};
