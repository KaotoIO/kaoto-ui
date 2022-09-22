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

//@ts-nocheck

import {
  Editor,
  EditorInitArgs,
  KogitoEditorChannelApi,
  KogitoEditorEnvelopeContextType,
} from "@kie-tools-core/editor/dist/api";
import { DEFAULT_RECT } from "@kie-tools-core/guided-tour/dist/api";
import { Notification } from "@kie-tools-core/notifications/dist/api";
import { KaotoEditor } from "./KaotoEditor";

export class KaotoEditorView implements Editor {
  private self: KaotoEditor;
  public af_isReact = true;
  public af_componentId: "kaoto-editor";
  public af_componentTitle: "Kaoto Editor";

  constructor(
    private readonly envelopeContext: KogitoEditorEnvelopeContextType<KogitoEditorChannelApi>,
    private readonly initArgs: EditorInitArgs
  ) {
    console.log({ initArgs });
  }

  public async getElementPosition() {
    return DEFAULT_RECT;
  }

  public setContent(path: string, content: string): Promise<void> {
    return this.self!.setContent(path, content);
  }

  public getContent(): Promise<string> {
    return this.self!.getContent();
  }

  public getPreview(): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  public af_componentRoot() {
    return (
      <KaotoEditor
        exposing={(s) => (this.self = s)}
        ready={() => this.envelopeContext.channelApi.notifications.kogitoEditor_ready.send()}
        newEdit={(edit) => this.envelopeContext.channelApi.notifications.kogitoWorkspace_newEdit.send(edit)}
        setNotifications={(path, notifications) =>
          this.envelopeContext.channelApi.notifications.kogitoNotifications_setNotifications.send(path, notifications)
        }
        resourcesPathPrefix={this.initArgs.resourcesPathPrefix}
      />
    );
  }

  public async undo(): Promise<void> {
    console.log(" Undo??? ");
    return this.self!.undo();
  }

  public async redo(): Promise<void> {
    console.log(" Redo??? ");
    return this.self!.redo();
  }

  public async validate(): Promise<Notification[]> {
    return Promise.resolve([]);
  }

  public async setTheme(): Promise<void> {
    // Only default theme is supported
    return Promise.resolve();
  }
}
