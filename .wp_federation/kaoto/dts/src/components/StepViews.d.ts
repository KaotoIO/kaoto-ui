import { IStepProps, IViewProps } from '../types';
export interface IStepViewsProps {
    deleteStep: (e: any) => void;
    isPanelExpanded: boolean;
    onClosePanelClick: (e: any) => void;
    saveConfig: (newValues: any) => void;
    step: IStepProps;
    views?: IViewProps[];
}
declare const StepViews: ({ deleteStep, isPanelExpanded, onClosePanelClick, saveConfig, step, views, }: IStepViewsProps) => JSX.Element;
export { StepViews };
