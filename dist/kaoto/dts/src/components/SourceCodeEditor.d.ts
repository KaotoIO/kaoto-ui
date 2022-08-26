/// <reference types="react" />
import { Language } from '@patternfly/react-code-editor';
interface ISourceCodeEditor {
    initialData?: string;
    language?: Language;
    theme?: string;
}
declare const SourceCodeEditor: (props: ISourceCodeEditor) => JSX.Element;
export { SourceCodeEditor };
