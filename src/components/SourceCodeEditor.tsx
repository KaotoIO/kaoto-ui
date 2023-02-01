import { fetchCapabilities, fetchIntegrationJson, fetchIntegrationSourceCode } from '@kaoto/api';
import { StepErrorBoundary } from '@kaoto/components';
import { useIntegrationJsonStore, useIntegrationSourceStore, useSettingsStore } from '@kaoto/store';
import { CodeEditorMode, ICapabilities, IIntegration, ISettings } from '@kaoto/types';
import { usePrevious } from '@kaoto/utils';
import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import { Alert } from '@patternfly/react-core';
import { CheckCircleIcon, EraserIcon, RedoIcon, UndoIcon } from '@patternfly/react-icons';
import { useEffect, useRef, useState } from 'react';
import EditorDidMount from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';

interface ISourceCodeEditor {
  initialData?: string;
  language?: Language;
  theme?: string;
  mode?: CodeEditorMode | CodeEditorMode.FREE_EDIT;
  schemaUri?: string;
  editable?: boolean | false;
  syncAction?: () => {};
}

const SourceCodeEditor = (props: ISourceCodeEditor) => {
  const editorRef = useRef<EditorDidMount['editor'] | null>(null);
  const { sourceCode, setSourceCode } = useIntegrationSourceStore();
  const [syncedCode, setSyncedCode] = useState('');
  const { integrationJson, updateIntegration } = useIntegrationJsonStore((state) => state);
  const { settings, setSettings } = useSettingsStore();
  const previousJson = usePrevious(integrationJson);
  const schemaUri = settings.dsl.validationSchema
    ? process.env.KAOTO_API + settings.dsl.validationSchema
    : '';

  useEffect(() => {
    let tmpInt: IIntegration = integrationJson;
    if (previousJson === integrationJson) return;

    if (tmpInt.dsl != null && tmpInt.dsl !== settings.dsl.name) {
      fetchCapabilities().then((capabilities: ICapabilities) => {
        capabilities.dsls.forEach((dsl) => {
          if (dsl.name === tmpInt.dsl) {
            const tmpSettings = { ...settings, dsl: dsl };
            setSettings(tmpSettings);
            fetchTheSourceCode(tmpInt, tmpSettings);
            return;
          }
        });
      });
    } else {
      fetchTheSourceCode(integrationJson, settings);
    }
  }, [integrationJson]);

  const fetchTheSourceCode = (integration: IIntegration, settings: ISettings) => {
    const tmpIntegration = {
      ...integration,
      metadata: { ...integrationJson.metadata, ...settings },
      dsl: settings.dsl.name,
    };

    fetchIntegrationSourceCode(tmpIntegration, settings.namespace).then((newSrc) => {
      if (typeof newSrc === 'string') {
        setSourceCode(newSrc);
        setSyncedCode(newSrc);
      }
    });
  };
  /**
   * On detected changes to YAML state, issue POST to external endpoint
   * Returns JSON to be displayed in the visualization
   */
  const handleChanges = (incomingData: string) => {
    // update integration JSON state with changes
    fetchIntegrationJson(incomingData, settings.dsl.name)
      .then((res: IIntegration) => {
        let tmpInt = res;
        if (typeof res.metadata?.name === 'string' && res.metadata.name !== '') {
          settings.name = res.metadata.name;
          setSettings({ name: res.metadata.name });
        }
        tmpInt.metadata = { ...res.metadata, ...settings };
        updateIntegration(tmpInt);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleEditorDidMount = (editor: EditorDidMount['editor']) => {
    import('monaco-yaml').then((im) => {
      im.setDiagnosticsOptions({
        enableSchemaRequest: props.schemaUri !== '',
        hover: false,
        completion: true,
        validate: props.schemaUri !== '',
        format: true,
        schemas: [
          {
            uri: schemaUri,
            fileMatch: ['*'],
          },
        ],
      });
    });

    const messageContribution: any = editor?.getContribution('editor.contrib.messageController');
    editor?.onDidAttemptReadOnlyEdit(() => {
      messageContribution?.showMessage(
        'Cannot edit in read-only editor mode.',
        editor.getPosition()
      );
    });

    editor?.revealLine(editor.getModel()?.getLineCount() ?? 0);
    editorRef.current = editor;
  };

  const debounced = useDebouncedCallback((value: string) => {
    if (props.mode === CodeEditorMode.TWO_WAY_SYNC) {
      handleChanges(value);
    }
  }, 1000);

  const syncChanges = (value: string) => {
    setSourceCode(value);
    debounced(value);
  };

  const clearAction = () => {
    setSourceCode('');
  };
  const undoAction = () => {
    (editorRef.current?.getModel() as any)?.undo();
  };

  const redoAction = () => {
    (editorRef.current?.getModel() as any)?.redo();
  };
  const updateModelFromTheEditor = () => {
    const updatedCode = editorRef.current?.getValue();
    if (updatedCode) {
      handleChanges(updatedCode);
    }
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

  const UpdateButton = (
    <CodeEditorControl
      key="updateButton"
      icon={<CheckCircleIcon color={'green'} />}
      aria-label="Apply the code"
      data-testid={'sourceCode--applyButton'}
      onClick={updateModelFromTheEditor}
      tooltipProps={{ content: 'Sync your code', position: 'right' }}
      isVisible={sourceCode !== '' && props.mode === CodeEditorMode.FREE_EDIT}
    />
  );

  return (
    <StepErrorBoundary>
      {syncedCode !== sourceCode && (
        <Alert
          title="Any invalid code will be replaced after sync. If you don't want to lose your changes
          please make a backup."
          variant="warning"
        ></Alert>
      )}
      <CodeEditor
        code={sourceCode ?? props.initialData}
        className="code-editor"
        height="80vh"
        width={'100%'}
        onCodeChange={syncChanges}
        language={Language.yaml}
        onEditorDidMount={handleEditorDidMount}
        toolTipPosition="right"
        customControls={[UndoButton, RedoButton, ClearButton, UpdateButton]}
        isCopyEnabled
        isDarkTheme={!settings.editorIsLightMode}
        isDownloadEnabled
        isLanguageLabelVisible
        allowFullScreen={true}
        isUploadEnabled
        options={{
          readOnly: props.mode === CodeEditorMode.READ_ONLY,
          scrollbar: {
            horizontal: 'visible',
            vertical: 'visible',
          },
          quickSuggestions: { other: true, strings: true },
        }}
      />
    </StepErrorBoundary>
  );
};

export { SourceCodeEditor };
