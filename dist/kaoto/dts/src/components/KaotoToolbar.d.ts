/// <reference types="react" />
export interface IKaotoToolbar {
    toggleCatalog: () => void;
    toggleCodeEditor: () => void;
}
export declare const KaotoToolbar: ({ toggleCatalog, toggleCodeEditor }: IKaotoToolbar) => JSX.Element;
export default KaotoToolbar;
