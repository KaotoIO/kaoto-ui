import * as EditorEnvelope from "@kie-tools-core/editor/dist/envelope";
import { NoOpKeyboardShortcutsService } from "@kie-tools-core/keyboard-shortcuts/dist/envelope";
import { KaotoEditorFactory } from "./KaotoEditorFactory";

export const init = ({ shouldUseNoOpKeyboardShortcutsService = true }) => EditorEnvelope.init({
  container: document.getElementById("kaoto-editor-envelope-app")!,
  bus: { postMessage: (message, targetOrigin, _) => targetOrigin && window.parent.postMessage(message, targetOrigin, _) },
  editorFactory: new KaotoEditorFactory(),
  ...(shouldUseNoOpKeyboardShortcutsService ?  { keyboardShortcutsService: new NoOpKeyboardShortcutsService() } : {}),
});
