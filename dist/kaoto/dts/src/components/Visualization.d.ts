/// <reference types="react" />
import { IViewData } from '../types';
import './Visualization.css';
import 'react-flow-renderer/dist/style.css';
import 'react-flow-renderer/dist/theme-default.css';
interface IVisualization {
    initialState?: IViewData;
    toggleCatalog?: () => void;
}
declare const Visualization: ({ toggleCatalog }: IVisualization) => JSX.Element;
export { Visualization };
