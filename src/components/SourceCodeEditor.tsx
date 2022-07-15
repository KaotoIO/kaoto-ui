import {
  fetchIntegrationJson,
  useIntegrationJsonStore,
  fetchIntegrationSourceCode,
  useSettingsStore,
  useSourceCodeStore,
} from '../api';
import { IIntegration } from '../types';
import { usePrevious } from '../utils';
import { StepErrorBoundary } from './StepErrorBoundary';
import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import { RedoIcon, UndoIcon } from '@patternfly/react-icons';
import { useEffect, useRef } from 'react';
import EditorDidMount from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';

interface ISourceCodeEditor {
  handleUpdateViews: (newViews: any) => void;
  // Used to mock data for stories
  initialData?: string;
  language?: Language;
  theme?: string;
}

const SourceCodeEditor = (props: ISourceCodeEditor) => {
  const editorRef = useRef<EditorDidMount['editor'] | null>(null);
  const { sourceCode, setSourceCode } = useSourceCodeStore();
  const { integrationJson, updateIntegration } = useIntegrationJsonStore((state) => state);
  const { settings } = useSettingsStore();
  const previousName = usePrevious(settings.name);

  useEffect(() => {
    if (previousName === settings.name) return;
    let tmpInt = integrationJson;
    tmpInt.metadata = { ...integrationJson.metadata, ...settings };

    fetchIntegrationSourceCode(tmpInt, settings.namespace).then((newSrc) => {
      if (typeof newSrc === 'string') setSourceCode(newSrc);
    });
  }, [settings.name]);

  /**
   * On detected changes to YAML state, issue POST to external endpoint
   * Returns JSON to be displayed in the visualization
   */
  const handleChanges = (incomingData: string) => {
    if (sourceCode !== incomingData) {
      setSourceCode(incomingData);

      // update integration JSON state with changes
      fetchIntegrationJson(incomingData, settings.dsl)
        .then((res: IIntegration) => {
          let tmpInt = res;
          tmpInt.metadata = { ...res.metadata, ...settings };
          updateIntegration(tmpInt);
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
      isVisible={sourceCode !== ''}
    />
  );

  const RedoButton = (
    <CodeEditorControl
      key="redoButton"
      icon={<RedoIcon />}
      aria-label="Redo change"
      toolTipText="Redo change"
      onClick={redoAction}
      isVisible={sourceCode !== ''}
    />
  );

  return (
    <StepErrorBoundary>
      <CodeEditor
        code={sourceCode ?? props.initialData}
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

export { SourceCodeEditor };
