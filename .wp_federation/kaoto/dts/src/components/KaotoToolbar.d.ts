import { IViewProps } from '../types';
export interface IKaotoToolbar {
    handleUpdateViews: (newViews: IViewProps[]) => void;
    toggleCatalog: () => void;
    toggleCodeEditor: () => void;
}
export declare const KaotoToolbar: ({ handleUpdateViews, toggleCatalog, toggleCodeEditor, }: IKaotoToolbar) => JSX.Element;
