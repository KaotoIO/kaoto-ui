import { IViewData, IViewProps } from '../types';
import './Visualization.css';
import 'react-flow-renderer/dist/style.css';
import 'react-flow-renderer/dist/theme-default.css';
interface IVisualization {
    handleUpdateViews: (newViews: IViewProps[]) => void;
    initialState?: IViewData;
    toggleCatalog?: () => void;
    views: IViewProps[];
}
declare const Visualization: ({ handleUpdateViews, toggleCatalog, views }: IVisualization) => JSX.Element;
export { Visualization };
