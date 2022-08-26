/// <reference types="react" />
import { IStepProps } from '../types';
export interface IStepViewsProps {
    deleteStep: (e: any) => void;
    isPanelExpanded: boolean;
    onClosePanelClick: (e: any) => void;
    saveConfig: (newValues: any) => void;
    step: IStepProps;
}
declare const StepViews: ({ deleteStep, isPanelExpanded, onClosePanelClick, saveConfig, step, }: IStepViewsProps) => JSX.Element;
export { StepViews };
