/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import './App.css';
import { KaotoEmptyState } from './EmptyState';
import { MenuButtons } from './MenuButtons';
import {
  ChannelType,
  EditorEnvelopeLocator,
  EnvelopeContent,
  EnvelopeContentType,
  EnvelopeMapping,
} from '@kie-tools-core/editor/dist/api';
import { EmbeddedEditorFile } from '@kie-tools-core/editor/dist/channel';
import {
  EmbeddedEditor,
  useEditorRef,
  useStateControlSubscription,
} from '@kie-tools-core/editor/dist/embedded';
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
  DrawerPanelContent,
  Page,
  PageSection,
} from '@patternfly/react-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type KaotoFileType = 'yml' | 'yaml';

interface File {
  path: string;
  content: string;
}

export const App = () => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [kaotoEmbeddedEditorFile, setKaotoEmbeddedEditorFile] = useState<EmbeddedEditorFile>();
  const [textEmbeddedEditorFile, setTextEmbeddedEditorFile] = useState<EmbeddedEditorFile>();
  const { editor: kaotoEditor, editorRef: kaotoEditorRef } = useEditorRef();
  const { editor: textEditor, editorRef: textEditorRef } = useEditorRef();
  const lastContent = useRef<string>();

  const kaotoEditorEnvelopeLocator = useMemo(
    () =>
      new EditorEnvelopeLocator(window.location.origin, [
        new EnvelopeMapping({
          type: 'kaoto',
          filePathGlob: '**/**(.+(kaoto|camel)).+(yml|yaml)',
          resourcesPathPrefix: '',
          envelopeContent: { type: EnvelopeContentType.PATH, path: 'envelope-kaoto-editor.html' },
        }),
      ]),
    [],
  );

  const textEditorEnvelopeLocator = useMemo(
    () =>
      new EditorEnvelopeLocator(window.location.origin, [
        new EnvelopeMapping({
          type: 'kaoto',
          filePathGlob: '**/**(.+(kaoto|camel)).+(yml|yaml)',
          resourcesPathPrefix: '',
          envelopeContent: {
            type: EnvelopeContentType.PATH,
            path: 'envelope-serverless-workflow-text-editor.html',
          },
        }),
      ]),
    [],
  );

  useEffect(() => {
    onSetContent('new-document.kaoto.yml', '');
  }, []);

  const onUndo = useCallback(async () => {
    kaotoEditor?.undo();
  }, [kaotoEditor]);

  const onRedo = useCallback(async () => {
    kaotoEditor?.redo();
  }, [kaotoEditor]);

  const onGetContent = useCallback(async () => kaotoEditor?.getContent() ?? '', [kaotoEditor]);

  const onSetTheme = useCallback(
    async (theme) => {
      kaotoEditor?.setTheme(theme);
    },
    [kaotoEditor],
  );

  const onValidate = useCallback(async () => {
    if (!kaotoEditor) {
      return;
    }

    const notifications = await kaotoEditor.validate();
    window.alert(JSON.stringify(notifications, undefined, 2));
  }, [kaotoEditor]);

  const onSetContent = useCallback((path: string, content: string) => {
    // const match = /\.kaoto\.(yml|yaml)$/.exec(path.toLowerCase());
    // const dotExtension = match ? match[0] : extname(path);
    // const extension = dotExtension.slice(1);
    // const fileName = basename(path);
    const extension = '.yml';
    const fileName = 'new-document.kaoto';

    setKaotoEmbeddedEditorFile({
      path: path,
      getFileContents: async () => content,
      isReadOnly: false,
      fileExtension: extension,
      fileName: fileName,
    });

    setTextEmbeddedEditorFile({
      path: path,
      getFileContents: async () => content,
      isReadOnly: false,
      fileExtension: extension,
      fileName: fileName,
    });
  }, []);

  const onNewContent = useCallback(
    (type: KaotoFileType) => {
      onSetContent(`new-document.kaoto.${type}`, '');
    },
    [onSetContent],
  );

  useStateControlSubscription(
    textEditor,
    useCallback(
      async (_isDirty) => {
        if (!textEditor) {
          return;
        }

        const content = await textEditor.getContent();
        // onNewEdit(new WorkspaceEdit(content));
        setFile((prevState) => ({
          ...prevState!,
          content,
        }));
      },
      [textEditor],
    ),
  );

  useStateControlSubscription(
    kaotoEditor,
    useCallback(
      async (_isDirty) => {
        if (!kaotoEditor) {
          return;
        }

        const content = await kaotoEditor.getContent();
        // onNewEdit(new WorkspaceEdit(content));
        setFile((prevState) => ({
          ...prevState!,
          content,
        }));
      },
      [kaotoEditor],
    ),
  );

  const updateEditors = useCallback(
    async (f: File) => {
      if (!textEditor || !kaotoEditor) {
        return;
      }

      await kaotoEditor.setContent(f.path, f.content);
      await textEditor.setContent(f.path, f.content);
    },
    [kaotoEditor, textEditor]
  );


  useEffect(() => {
    if (file?.content === undefined || file.content === lastContent.current) {
      return;
    }

    lastContent.current = file.content;
    updateEditors(file);
  }, [file, updateEditors]);

  return (
    <Page>
      {!kaotoEmbeddedEditorFile && (
        <PageSection isFilled={true}>
          <KaotoEmptyState newContent={onNewContent} setContent={onSetContent} />
        </PageSection>
      )}

      {kaotoEmbeddedEditorFile && (
        <>
          <PageSection padding={{ default: 'noPadding' }}>
            <MenuButtons
              undo={onUndo}
              redo={onRedo}
              get={onGetContent}
              setTheme={onSetTheme}
              validate={onValidate}
            />
          </PageSection>

          <Drawer isExpanded={true} isInline={true}>
            <DrawerContent
              panelContent={
                <DrawerPanelContent isResizable={true} defaultSize="70%">
                  <DrawerPanelBody style={{ padding: 0 }}>
                    <div className="editor-container">
                      <EmbeddedEditor
                        ref={kaotoEditorRef}
                        file={kaotoEmbeddedEditorFile}
                        channelType={ChannelType.ONLINE}
                        editorEnvelopeLocator={kaotoEditorEnvelopeLocator}
                        locale={'en'}
                      />
                    </div>
                  </DrawerPanelBody>
                </DrawerPanelContent>
              }
            >
              <DrawerContentBody>
                <div className="editor-container">
                  {textEmbeddedEditorFile && (
                    <EmbeddedEditor
                      ref={textEditorRef}
                      file={textEmbeddedEditorFile}
                      channelType={ChannelType.ONLINE}
                      editorEnvelopeLocator={textEditorEnvelopeLocator}
                      locale={'en'}
                    />
                  )}
                </div>
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </Page>
  );
};
