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

import {
  ChannelType,
  EditorEnvelopeLocator,
  EnvelopeContentType,
  EnvelopeMapping
} from '@kie-tools-core/editor/dist/api';
import { EmbeddedEditorFile } from '@kie-tools-core/editor/dist/channel';
import { EmbeddedEditor, useEditorRef } from '@kie-tools-core/editor/dist/embedded';
import { Drawer, DrawerContent, DrawerContentBody, DrawerPanelBody, DrawerPanelContent, Page, PageSection } from '@patternfly/react-core';
import { basename, extname } from 'path';
import { useCallback, useMemo, useState } from 'react';
import './App.css';
import { KaotoEmptyState } from './EmptyState';
import { MenuButtons } from './MenuButtons';

export type KaotoFileType = 'yml' | 'yaml';

export const App = () => {
  const [kaotoEmbeddedEditorFile, setKaotoEmbeddedEditorFile] = useState<EmbeddedEditorFile>();
  const [textEmbeddedEditorFile, setTextEmbeddedEditorFile] = useState<EmbeddedEditorFile>();
  const { editor: kaotoEditor, editorRef: kaotoEditorRef } = useEditorRef();
  const { editor: textEditor, editorRef: textEditorRef } = useEditorRef();

  const kaotoEditorEnvelopeLocator = useMemo(
    () =>
      new EditorEnvelopeLocator(window.location.origin, [
        new EnvelopeMapping({
          type: 'kaoto',
          filePathGlob: '**/**(.+(kaoto|camel)).+(yml|yaml)',
          resourcesPathPrefix: '',
          envelopeContent: { type: EnvelopeContentType.PATH, path: 'kaoto-editor-envelope.html' },
        }),
      ]),
    []
  );

  const textEditorEnvelopeLocator = useMemo(
    () =>
      new EditorEnvelopeLocator(window.location.origin, [
        new EnvelopeMapping({
          type: 'text',
          filePathGlob: '**/**(.+(kaoto|camel)).+(yml|yaml)',
          resourcesPathPrefix: '',
          envelopeContent: { type: EnvelopeContentType.PATH, path: 'serverless-workflow-text-editor-envelope.html' },
        }),
      ]),
    []
  );

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
    [kaotoEditor]
  );

  const onValidate = useCallback(async () => {
    if (!kaotoEditor) {
      return;
    }

    const notifications = await kaotoEditor.validate();
    window.alert(JSON.stringify(notifications, undefined, 2));
  }, [kaotoEditor]);

  const onSetContent = useCallback((path: string, content: string) => {
    const match = /\.kaoto\.(yml|yaml)$/.exec(path.toLowerCase());
    const dotExtension = match ? match[0] : extname(path);
    const extension = dotExtension.slice(1);
    const fileName = basename(path);

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
    [onSetContent]
  );

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
            <MenuButtons undo={onUndo} redo={onRedo} get={onGetContent} setTheme={onSetTheme} validate={onValidate} />
          </PageSection>

          <Drawer isExpanded={true} isInline={true}>
            <DrawerContent
              panelContent={
                <DrawerPanelContent isResizable={true} defaultSize="50%">
                  <DrawerPanelBody style={{ padding: 0 }}>
                    <div className='editor-container'>
                      {kaotoEmbeddedEditorFile && (
                        <EmbeddedEditor
                          ref={kaotoEditorRef}
                          file={kaotoEmbeddedEditorFile}
                          channelType={ChannelType.ONLINE}
                          editorEnvelopeLocator={kaotoEditorEnvelopeLocator}
                          locale={'en'}
                        />
                      )}
                    </div>
                  </DrawerPanelBody>
                </DrawerPanelContent>
              }
            >
              <DrawerContentBody>
                <div className='editor-container'>
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
