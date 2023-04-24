/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { RefObject, createRef } from "react";

import {
  Editor,
  EditorApi,
  EditorInitArgs,
  EditorTheme,
  KogitoEditorChannelApi,
  KogitoEditorEnvelopeContextType,
} from "@kie-tools-core/editor/dist/api";
import { DEFAULT_RECT } from "@kie-tools-core/guided-tour/dist/api";
import { Notification } from "@kie-tools-core/notifications/dist/api";
import { KaotoEditor } from "./KaotoEditor";
import { RequestService } from '../api';

export class KaotoEditorView implements Editor {
  private readonly editorRef: RefObject<EditorApi>;
  af_isReact = true;
  af_componentId = "kaoto-editor";
  af_componentTitle = "Kaoto Editor";

  constructor(
    private readonly envelopeContext: KogitoEditorEnvelopeContextType<KogitoEditorChannelApi>,
    private readonly initArgs: EditorInitArgs,
    private readonly apiUrl?: string,
  ) {
    this.editorRef = createRef<EditorApi>();

    if (this.apiUrl) {
      RequestService.setApiURL(this.apiUrl);
    }
  }

  async getElementPosition() {
    return DEFAULT_RECT;
  }

  setContent(path: string, content: string): Promise<void> {
    return this.editorRef.current!.setContent(path, content);
  }

  getContent(): Promise<string> {
    return this.editorRef.current!.getContent();
  }

  getPreview(): Promise<string | undefined> {
    return this.editorRef.current!.getPreview();
  }

  af_componentRoot() {
    return (
      <KaotoEditor
        ref={this.editorRef}
        channelType={this.initArgs.channel}
        onReady={() => this.envelopeContext.channelApi.notifications.kogitoEditor_ready.send()}
        onNewEdit={(edit) => {
          this.envelopeContext.channelApi.notifications.kogitoWorkspace_newEdit.send(edit);
        }}
        setNotifications={(path, notifications) =>
          this.envelopeContext.channelApi.notifications.kogitoNotifications_setNotifications.send(path, notifications)
        }
        onStateControlCommandUpdate={(command) =>
          this.envelopeContext.channelApi.notifications.kogitoEditor_stateControlCommandUpdate.send(command)
        }
      />
    );
  }

  async undo(): Promise<void> {
    return this.editorRef.current!.undo();
  }

  async redo(): Promise<void> {
    return this.editorRef.current!.redo();
  }

  async validate(): Promise<Notification[]> {
    return this.editorRef.current!.validate();
  }

  async setTheme(theme: EditorTheme) {
    return this.editorRef.current!.setTheme(theme);
  }
}
