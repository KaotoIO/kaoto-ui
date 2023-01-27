import { fetchIntegrationJson, fetchIntegrationSourceCode } from '@kaoto/api';
import { StepErrorBoundary } from '@kaoto/components';
import { useIntegrationJsonStore, useIntegrationSourceStore, useSettingsStore } from '@kaoto/store';
import { CodeEditorMode, IIntegration } from '@kaoto/types';
import { usePrevious } from '@kaoto/utils';
import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import {
  CheckCircleIcon,
  EraserIcon,
  PencilAltIcon,
  RedoIcon,
  UndoIcon,
} from '@patternfly/react-icons';
import { ReactNode, useEffect, useRef } from 'react';
import EditorDidMount from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';

interface ISourceCodeEditor {
  initialData?: string;
  language?: Language;
  theme?: string;
  mode?: CodeEditorMode | CodeEditorMode.FREE_EDIT;
  editable?: boolean | false;
  editAction?: (code: string, event?: any) => void;
  syncAction?: () => {};
}

const SourceCodeEditor = (props: ISourceCodeEditor) => {
  const editorRef = useRef<EditorDidMount['editor'] | null>(null);
  const { sourceCode, setSourceCode } = useIntegrationSourceStore();
  const { integrationJson, updateIntegration } = useIntegrationJsonStore((state) => state);
  const { settings, setSettings } = useSettingsStore();
  const previousJson = usePrevious(integrationJson);
  const schemaUri = settings.dsl.validationSchema
    ? process.env.KAOTO_API + settings.dsl.validationSchema
    : '';

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
    }
  };

  const handleEditorDidMount = (editor: EditorDidMount['editor']) => {
    import('monaco-yaml').then((im) => {
      im.setDiagnosticsOptions({
        enableSchemaRequest: settings.dsl.validationSchema != '',
        hover: false,
        completion: true,
        validate: settings.dsl.validationSchema != '',
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
    // if editor is in read only mode file can be still uploaded.
    if (props.mode !== CodeEditorMode.FREE_EDIT) {
      handleChanges(value);
    }
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
  const EditButton = (
    <CodeEditorControl
      key={'editButton'}
      icon={<PencilAltIcon color="#0066CC" />}
      data-testid={'sourceCode--editButton'}
      onClick={props.editAction ?? (() => {})}
      isVisible={props.mode === CodeEditorMode.FREE_EDIT}
      tooltipProps={{ content: 'Edit the source code', position: 'right' }}
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
      isVisible={sourceCode !== ''}
    />
  );

  let customControls: ReactNode[] = [EditButton];
  if (props.mode === CodeEditorMode.TWO_WAY_SYNC) {
    customControls = [UndoButton, RedoButton, ClearButton];
  } else if (props.mode === CodeEditorMode.FREE_EDIT && props.editable) {
    customControls = [UndoButton, RedoButton, ClearButton, UpdateButton];
  }

  return (
    <StepErrorBoundary>
      <CodeEditor
        code={sourceCode ?? props.initialData}
        className="code-editor"
        height="80vh"
        width={'100%'}
        onCodeChange={debounced}
        language={Language.yaml}
        onEditorDidMount={handleEditorDidMount}
        toolTipPosition="right"
        customControls={customControls}
        isCopyEnabled
        isDarkTheme={!settings.editorIsLightMode}
        isDownloadEnabled
        isLanguageLabelVisible
        allowFullScreen={true}
        isUploadEnabled
        options={{
          readOnly: props.mode === CodeEditorMode.READ_ONLY || !props.editable,
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
