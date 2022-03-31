import { fetchViewDefinitions, useStepsAndViewsContext, useYAMLContext } from '../api';
import { usePrevious } from '../utils';
import { StepErrorBoundary } from './StepErrorBoundary';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useEffect, useRef } from 'react';
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
  const shouldUpdateVisualization = useRef(false);

  useEffect(() => {
    // Check that the data has changed, otherwise return
    if (previousYaml === YAMLData) {
      return;
    }

    if (shouldUpdateVisualization.current) {
      fetchViewDefinitions(YAMLData)
        .then((res) => {
          // update Visualization with new data
          dispatch({ type: 'UPDATE_INTEGRATION', payload: res });
        })
        .catch((e) => {
          console.error(e);
        });

      shouldUpdateVisualization.current = false;
    }
  }, [YAMLData, dispatch, previousYaml]);

  /**
   * On detected changes to YAML state, issue POST to external endpoint
   * Returns JSON to be displayed in the visualizer
   */
  const handleChanges = (incomingData?: string) => {
    // Check that the data has changed, otherwise return
    if (previousYaml === incomingData) {
      return;
    }

    shouldUpdateVisualization.current = true;
    setYAMLData(incomingData);
  };

  function handleEditorChange(value?: string) {
    debounced(value);
  }

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
  }

  const debounced = useDebouncedCallback((value?: string) => {
    handleChanges(value);
  }, 1000);

  return (
    <StepErrorBoundary>
      <CodeEditor
        code={YAMLData ?? props.initialData}
        className={'code-editor'}
        height="650px"
        isCopyEnabled={true}
        isDarkTheme={true}
        isDownloadEnabled={true}
        isLanguageLabelVisible={true}
        isUploadEnabled={true}
        language={(props.language as Language) ?? Language.yaml}
        onChange={handleEditorChange}
        onEditorDidMount={handleEditorDidMount}
        toolTipPosition={'right'}
      />
    </StepErrorBoundary>
  );
};

export { YAMLEditor };
