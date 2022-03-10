import { fetchViewDefinitions, useStepsAndViewsContext, useYAMLContext } from '../api';
import { usePrevious } from '../utils';
import { StepErrorBoundary } from './StepErrorBoundary';
// import Editor from '@monaco-editor/react';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface IYAMLEditor {
  // Used to mock data for stories
  initialData?: string;
  language?: Language;
  theme?: string;
}

const YAMLEditor = (props: IYAMLEditor) => {
  const editorRef = useRef(null);
  const [YAMLData, setYAMLData] = useYAMLContext();
  const [, dispatch] = useStepsAndViewsContext();
  const previousYaml = usePrevious(YAMLData);

  /**
   * On detected changes to YAML state, issue POST to external endpoint
   * Returns JSON to be displayed in the visualizer
   */
  const handleChanges = (incomingData?: string) => {
    // Wait a bit before setting data
    setTimeout(() => {
      // Check that the data has changed, otherwise return
      if (previousYaml === incomingData) {
        return;
      }

      setYAMLData(incomingData);

      fetchViewDefinitions(incomingData)
        .then((res) => {
          // update Visualization with new data
          dispatch({ type: 'UPDATE_INTEGRATION', payload: res });
        })
        .catch((e) => {
          console.error(e);
        });
    }, 750);
  };

  function handleEditorChange(value?: string) {
    debounced(value);
  }

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
  }

  const debounced = useDebouncedCallback((value?: string) => {
    handleChanges(value);
  }, 800);

  return (
    <StepErrorBoundary>
      <CodeEditor
        code={props.initialData ?? YAMLData}
        height="650px"
        isCopyEnabled={true}
        isDarkTheme={true}
        isDownloadEnabled={true}
        isLanguageLabelVisible={true}
        isUploadEnabled={true}
        language={Language.yaml}
        onChange={handleEditorChange}
        onEditorDidMount={handleEditorDidMount}
      />
    </StepErrorBoundary>
  );
};

export { YAMLEditor };
