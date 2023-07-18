/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ServerlessWorkflowTextEditorChannelApi } from '../api';
import { SwfTextEditorApi, SwfTextEditorController } from './SwfTextEditorController';
import {
  ChannelType,
  EditorTheme,
  useKogitoEditorEnvelopeContext,
} from '@kie-tools-core/editor/dist/api';
import { useSharedValue } from '@kie-tools-core/envelope-bus/dist/hooks';
import { getFileLanguage } from '@kie-tools/serverless-workflow-language-service/dist/api';
import { editor } from 'monaco-editor';
import {
  ForwardRefRenderFunction,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';

interface Props {
  content: string;
  fileName: string;
  onContentChange: (content: string) => void;
  channelType: ChannelType;
  setValidationErrors: (errors: editor.IMarker[]) => void;
  isReadOnly: boolean;
}

const RefForwardingSwfTextEditor: ForwardRefRenderFunction<SwfTextEditorApi | undefined, Props> = (
  { content, fileName, onContentChange, channelType, isReadOnly, setValidationErrors },
  forwardedRef,
) => {
  const container = useRef<HTMLDivElement>(null);
  const editorEnvelopeCtx =
    useKogitoEditorEnvelopeContext<ServerlessWorkflowTextEditorChannelApi>();
  const [theme] = useSharedValue(editorEnvelopeCtx.channelApi?.shared.kogitoEditor_theme);

  const fileLanguage = useMemo(() => getFileLanguage(fileName), [fileName]);

  const onSelectionChanged = useCallback((nodeName: string) => {
    editorEnvelopeCtx.channelApi.notifications.kogitoSwfTextEditor__onSelectionChanged.send({
      nodeName,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const controller: SwfTextEditorApi = useMemo<SwfTextEditorApi>(() => {
    return new SwfTextEditorController(
      content,
      onContentChange,
      fileLanguage!,
      editorEnvelopeCtx.operatingSystem,
      isReadOnly,
      setValidationErrors,
      onSelectionChanged,
    );
  }, [content, editorEnvelopeCtx.operatingSystem, fileLanguage, isReadOnly, onContentChange, onSelectionChanged, setValidationErrors]);

  useEffect(() => {
    controller.forceRedraw();
  }, [controller]);

  useEffect(() => {
    if (!container.current) {
      return;
    }

    if (editorEnvelopeCtx.channelApi && theme === undefined) {
      return;
    }

    controller.show(container.current, theme ?? EditorTheme.LIGHT);

    return () => {
      controller.dispose();
    };
  }, [
    content,
    fileName,
    channelType,
    controller,
    theme,
    editorEnvelopeCtx.channelApi,
    editorEnvelopeCtx.operatingSystem,
  ]);

  useImperativeHandle(forwardedRef, () => controller, [controller]);

  return <div style={{ height: '100%' }} ref={container} />;
};

export const SwfTextEditor = forwardRef(RefForwardingSwfTextEditor);
