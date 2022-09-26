import "./KaotoEditor.css";
import { AlertProvider, MASLoading } from "../layout";
import { AppLayout } from "../layout/AppLayout";
import { AppRoutes } from "../routes";
import { HashRouter as Router } from "react-router-dom";

import { Suspense, forwardRef, useState, useCallback, useImperativeHandle, useEffect, useRef } from "react";
import { WorkspaceEdit } from "@kie-tools-core/workspace/dist/api";
import { Notification } from "@kie-tools-core/notifications/dist/api";
import { KaotoIntegrationProviderRef, KogitoEditorIntegrationProvider } from "./KogitoEditorIntegrationProvider";
import { ChannelType, EditorApi, StateControlCommand } from "@kie-tools-core/editor/dist/api";

interface Props {
  /**
   * Delegation for KogitoEditorChannelApi.kogitoEditor_ready() to signal to the Channel
   * that the editor is ready. Increases the decoupling of the DashbuilderEditor from the Channel.
   */
  onReady: () => void;

  /**
   * Delegation for KogitoEditorChannelApi.kogitoEditor_stateControlCommandUpdate(command) to signal to the Channel
   * that the editor is performing an undo/redo operation. Increases the decoupling of the DashbuilderEditor
   * from the Channel.
   */
  onStateControlCommandUpdate: (command: StateControlCommand) => void;

  /**
   * Delegation for WorkspaceChannelApi.kogitoWorkspace_newEdit(edit) to signal to the Channel
   * that a change has taken place. Increases the decoupling of the DashbuilderEditor from the Channel.
   * @param edit An object representing the unique change.
   */
  onNewEdit: (edit: WorkspaceEdit) => void;

  /**
   * Delegation for NotificationsChannelApi.kogigotNotifications_setNotifications(path, notifications) to report all validation
   * notifications to the Channel that will replace existing notification for the path. Increases the
   * decoupling of the DashbuilderEditor from the Channel.
   * @param path The path that references the Notification
   * @param notifications List of Notifications
   */
  setNotifications: (path: string, notifications: Notification[]) => void;

  /**
   * ChannelType where the component is running.
   */
  channelType: ChannelType;
}

export const KaotoEditor = forwardRef<EditorApi, Props>((props, forwardedRef) => {
  const [editorContent, setEditorContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const providerRef = useRef<KaotoIntegrationProviderRef>(null);

  const isVSCode = useCallback(() => {
    return props.channelType === ChannelType.VSCODE_DESKTOP || props.channelType === ChannelType.VSCODE_WEB;
  }, [props]);

  /**
   * Callback is exposed to the Channel to retrieve the current value of the Editor. It returns the value of
   * the editorContent, which is the state that has the kaoto yaml.
   */
  const getContent = useCallback(() => {
    return editorContent;
  }, [editorContent]);

  const updateEditorToInitialState = useCallback(() => {
    setEditorContent(initialContent)
  }, [initialContent]);

  /**
   * Callback is exposed to the Channel that is called when a new file is opened. It sets the originalContent to the received value.
   */
  const setContent = useCallback(
    (path: string, content: string) => {
      setInitialContent(content);
      updateEditorToInitialState();
    },
    []
  );

  const onContentChanged = useCallback((newContent: string, operation: "EDIT" | "UNDO" | "REDO") => {
    setEditorContent(newContent);
    if (operation === "EDIT") {
      props.onNewEdit(new WorkspaceEdit(newContent));
    } else if (operation === "UNDO") {
      if (!isVSCode()) {
        providerRef.current?.undo();
      }
      props.onStateControlCommandUpdate(StateControlCommand.UNDO);
    } else if (operation === "REDO") {
      if (!isVSCode()) {
        providerRef.current?.redo();
      }
      props.onStateControlCommandUpdate(StateControlCommand.REDO);
    }
  }, [props, isVSCode]);

  // /**
  //  * Do a undo command on the State Control and update the current state of the Editor
  //  */
  // const undo = useCallback(() => {
  //   stateControl.undo();
  //   updateEditorStateWithCurrentEdit(stateControl.getCurrentCommand()?.id);
  // }, [stateControl]);

  // /**
  //  * Do a redo command on the State Control and update the current state of the Editor
  //  */
  // const redo = useCallback(() => {
  //   stateControl.redo();
  //   updateEditorStateWithCurrentEdit(stateControl.getCurrentCommand()?.id);
  // }, [stateControl]);

  // /**
  //  * Update the current state of the Editor using an edit.
  //  * If the edit is undefined which indicates that the current state is the initial one, the Editor state goes back to the initial state.
  //  */
  // const updateEditorStateWithCurrentEdit = useCallback((edit?: string) => {
  //   if (edit) {
  //     setEditorContent(edit);
  //   } else {
  //     updateEditorToInitialState();
  //   }
  // }, [updateEditorToInitialState]);

  /**
   * Notify the channel that the Editor is ready after the first render. That enables it to open files.
   */
  useEffect(() => {
    console.log("HERE");
    props.onReady();
  }, []);

  /**
   * The useImperativeHandler gives the control of the Editor component to who has it's reference, making it possible to communicate with the Editor.
   * It returns all methods that are determined on the EditorApi.
   */
  useImperativeHandle(forwardedRef, () => {
    return {
      getContent: () => Promise.resolve(getContent()),
      setContent: (path: string, content: string) => Promise.resolve(setContent(path, content)),
      getPreview: () => Promise.resolve(undefined),
      undo: (): Promise<void> => {
        return providerRef.current?.undo() || Promise.resolve();
      },
      redo: (): Promise<void> => {
        return providerRef.current?.redo() || Promise.resolve();
      },
      getElementPosition: () => Promise.resolve(undefined),
      validate: () => Promise.resolve([]),
      setTheme: () => Promise.resolve(),
    };
  });

  return (
    <KogitoEditorIntegrationProvider
      content={editorContent}
      onContentChanged={onContentChanged}
      ref={providerRef}
    >
      <AlertProvider>
        <Router>
          <Suspense fallback={<MASLoading />}>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </Suspense>
        </Router>
      </AlertProvider>
    </KogitoEditorIntegrationProvider>
  );
});
