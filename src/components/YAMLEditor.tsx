import { useYAMLContext, useStepsAndViewsContext, fetchViewDefinitions } from '../api';
import { StepErrorBoundary } from './StepErrorBoundary';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import EditorDidMount from 'react-monaco-editor';

interface IYAMLEditor {
  // Used to mock data for stories
  initialData?: string;
  language?: Language;
  theme?: string;
}

const YAMLEditor = (props: IYAMLEditor) => {
  const editorRef = useRef<EditorDidMount["editor"] | null >(null);
  const [YAMLData, setYAMLData] = useYAMLContext();
  const [, dispatch] = useStepsAndViewsContext();

  /**
   * On detected changes to YAML state, issue POST to external endpoint
   * Returns JSON to be displayed in the visualizer
   */
  const handleChanges = (incomingData: string) => {
    if (YAMLData !== incomingData) {
      setYAMLData(incomingData);
      fetchViewDefinitions(incomingData)
        .then((res) => {
          dispatch({ type: 'UPDATE_INTEGRATION', payload: res });
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const handleEditorDidMount = (editor: EditorDidMount["editor"]) => {
    editorRef.current = editor;
    editorRef.current?.onDidChangeModelContent(() => {
      const editorYAML = editorRef.current?.getValue();
      if (editorYAML) {
        debounced(editorYAML);
      }
    });
  };

  const debounced = useDebouncedCallback((value: string) => {
    handleChanges(value);
  }, 1000);

  return (
    <StepErrorBoundary>
      <CodeEditor
        code={YAMLData ?? props.initialData}
        className="code-editor"
        height="650px"
        language={(props.language as Language) ?? Language.yaml}
        onEditorDidMount={handleEditorDidMount}
        toolTipPosition="right"
        isCopyEnabled
        isDarkTheme
        isDownloadEnabled
        isLanguageLabelVisible
        isUploadEnabled
      />
    </StepErrorBoundary>
  );
};

export { YAMLEditor };
