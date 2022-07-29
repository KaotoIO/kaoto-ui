import { IVizStepNodeData } from '../types';
import './Visualization.css';
export interface IVisualizationSlot {
    data: IVizStepNodeData;
}
declare const VisualizationSlot: ({ data }: IVisualizationSlot) => JSX.Element;
export { VisualizationSlot };
