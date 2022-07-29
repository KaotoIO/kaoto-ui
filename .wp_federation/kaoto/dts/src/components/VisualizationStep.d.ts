import { IVizStepNodeData } from '../types';
import './Visualization.css';
import { NodeProps } from 'react-flow-renderer';
declare const VisualizationStep: ({ data }: NodeProps<IVizStepNodeData>) => JSX.Element;
export { VisualizationStep };
