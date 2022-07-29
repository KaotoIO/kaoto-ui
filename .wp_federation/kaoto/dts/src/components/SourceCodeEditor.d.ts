import { Language } from '@patternfly/react-code-editor';
interface ISourceCodeEditor {
    handleUpdateViews: (newViews: any) => void;
    initialData?: string;
    language?: Language;
    theme?: string;
}
declare const SourceCodeEditor: (props: ISourceCodeEditor) => JSX.Element;
export { SourceCodeEditor };
