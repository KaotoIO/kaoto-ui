import { fetchIntegrationJson, fetchIntegrationSourceCode } from '@kaoto/api';
import { StepErrorBoundary } from '@kaoto/components';
import { useIntegrationJsonStore, useIntegrationSourceStore, useSettingsStore } from '@kaoto/store';
import { IIntegration } from '@kaoto/types';
import { usePrevious } from '@kaoto/utils';
import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import { EraserIcon, RedoIcon, UndoIcon } from '@patternfly/react-icons';
import { useEffect, useRef } from 'react';
import EditorDidMount from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';

interface ISourceCodeEditor {
  initialData?: string;
  language?: Language;
  theme?: string;
}

const SourceCodeEditor = (props: ISourceCodeEditor) => {
  const editorRef = useRef<EditorDidMount['editor'] | null>(null);
  const { sourceCode, setSourceCode } = useIntegrationSourceStore();
  const { integrationJson, updateIntegration } = useIntegrationJsonStore((state) => state);
  const { settings, setSettings } = useSettingsStore();
  const previousJson = usePrevious(integrationJson);

  useEffect(() => {
    if (previousJson === integrationJson) return;
    let tmpInt = integrationJson;
    tmpInt.metadata = { ...integrationJson.metadata, ...settings };
    fetchIntegrationSourceCode(tmpInt, settings.namespace).then((newSrc) => {
      if (typeof newSrc === 'string') setSourceCode(newSrc);
    });
  }, [integrationJson]);

  /**
   * On detected changes to YAML state, issue POST to external endpoint
   * Returns JSON to be displayed in the visualization
   */
  const handleChanges = (incomingData: string) => {
    if (sourceCode !== incomingData) {
      setSourceCode(incomingData);

      // update integration JSON state with changes
      fetchIntegrationJson(incomingData, settings.dsl.name)
        .then((res: IIntegration) => {
          let tmpInt = res;
          if (res.metadata.name != '') {
            settings.name = res.metadata.name;
            setSettings({ name: res.metadata.name });
          }
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

  const clearAction = () => {
    setSourceCode('');
  };

  const undoAction = () => {
    (editorRef.current?.getModel() as any)?.undo();
  };

  const redoAction = () => {
    (editorRef.current?.getModel() as any)?.redo();
  };

  const ClearButton = (
    <CodeEditorControl
      key={'clearButton'}
      icon={<EraserIcon />}
      data-testid={'sourceCode--clearButton'}
      onClick={clearAction}
      isVisible={sourceCode !== ''}
      tooltipProps={{ content: 'Clear', position: 'right' }}
    />
  );

  const UndoButton = (
    <CodeEditorControl
      key="undoButton"
      icon={<UndoIcon />}
      aria-label="Undo change"
      data-testid={'sourceCode--undoButton'}
      onClick={undoAction}
      isVisible={sourceCode !== ''}
      tooltipProps={{ content: 'Undo change', position: 'right' }}
    />
  );

  const RedoButton = (
    <CodeEditorControl
      key="redoButton"
      icon={<RedoIcon />}
      aria-label="Redo change"
      data-testid={'sourceCode--redoButton'}
      onClick={redoAction}
      isVisible={sourceCode !== ''}
      tooltipProps={{ content: 'Redo change', position: 'right' }}
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
        customControls={[UndoButton, RedoButton, ClearButton]}
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
