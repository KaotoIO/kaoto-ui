import {
  useYAMLContext,
  useStepsAndViewsContext,
  fetchViewDefinitions,
  fetchCustomResource,
} from '../api';
import { StepErrorBoundary } from './StepErrorBoundary';
import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import { RedoIcon, UndoIcon } from '@patternfly/react-icons';
import { useRef } from 'react';
import EditorDidMount from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';

interface IYAMLEditor {
  dsl: string;
  // Used to mock data for stories
  initialData?: string;
  language?: Language;
  theme?: string;
}

const YAMLEditor = (props: IYAMLEditor) => {
  const editorRef = useRef<EditorDidMount['editor'] | null>(null);
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
          /**
           * Use new API-provided view definition to re-fetch the "proper" custom
           * resource (YAML). Used to fill any relevant YAML data missed while
           * manually typing.
           */
          fetchCustomResource(res.steps, 'integration', props.dsl).then((yamlResponse) => {
            if (typeof yamlResponse === 'string') {
              setYAMLData(yamlResponse);
            }
          });
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const handleEditorDidMount = (editor: EditorDidMount['editor']) => {
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

  const undoAction = () => {
    (editorRef.current?.getModel() as any)?.undo();
  };
  const redoAction = () => {
    (editorRef.current?.getModel() as any)?.redo();
  };

  const UndoButton = (
    <CodeEditorControl
      key="undoButton"
      icon={<UndoIcon />}
      aria-label="Undo change"
      toolTipText="Undo change"
      onClick={undoAction}
      isVisible={YAMLData !== ''}
    />
  );

  const RedoButton = (
    <CodeEditorControl
      key="redoButton"
      icon={<RedoIcon />}
      aria-label="Redo change"
      toolTipText="Redo change"
      onClick={redoAction}
      isVisible={YAMLData !== ''}
    />
  );

  return (
    <StepErrorBoundary>
      <CodeEditor
        code={YAMLData ?? props.initialData}
        className="code-editor"
        height="650px"
        language={(props.language as Language) ?? Language.yaml}
        onEditorDidMount={handleEditorDidMount}
        toolTipPosition="right"
        customControls={[UndoButton, RedoButton]}
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
