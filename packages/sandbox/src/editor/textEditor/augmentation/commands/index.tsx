import { editor, Position } from "monaco-editor";
import { openWidget } from "../widgets";
import { ServerlessWorkflowTextEditorChannelApi } from "../../../api";
import { MessageBusClientApi } from "@kie-tools-core/envelope-bus/dist/api";
import {
  SwfLanguageServiceCommandArgs,
  SwfLanguageServiceCommandIds,
} from "@kie-tools/serverless-workflow-language-service/dist/api";

export function initAugmentationCommands(
  editorInstance: editor.IStandaloneCodeEditor,
  channelApi: MessageBusClientApi<ServerlessWorkflowTextEditorChannelApi>
  ): SwfLanguageServiceCommandIds {
    return {
      "swf.ls.commands.RefreshServiceRegistries": editorInstance.addCommand(
        0,
      async (_ctx: editor.ICommandHandler, _args: SwfLanguageServiceCommandArgs["swf.ls.commands.RefreshServiceRegistries"]) => {
        channelApi.notifications.kogitoSwfServiceCatalog_refresh.send();
      }
    )!,
    "swf.ls.commands.LogInServiceRegistries": editorInstance.addCommand(
      0,
      async (_ctx: editor.ICommandHandler, _args: SwfLanguageServiceCommandArgs["swf.ls.commands.LogInServiceRegistries"]) => {
        channelApi.notifications.kogitoSwfServiceCatalog_logInServiceRegistries.send();
      }
    )!,
    "swf.ls.commands.OpenServiceRegistriesConfig": editorInstance.addCommand(
      0,
      async (_ctx: editor.ICommandHandler, _args: SwfLanguageServiceCommandArgs["swf.ls.commands.OpenServiceRegistriesConfig"]) => {
        channelApi.notifications.kogitoSwfServiceCatalog_setupServiceRegistriesSettings.send();
      }
    )!,
    "swf.ls.commands.ImportFunctionFromCompletionItem": editorInstance.addCommand(
      0,
      async (_ctx: editor.ICommandHandler, args: SwfLanguageServiceCommandArgs["swf.ls.commands.ImportFunctionFromCompletionItem"]) => {
        channelApi.notifications.kogitoSwfServiceCatalog_importFunctionFromCompletionItem.send(args);
      }
    )!,
    "swf.ls.commands.OpenCompletionItems": editorInstance.addCommand(
      0,
      // @ts-expect-error
      async (_ctx: editor.ICommandHandler, args: SwfLanguageServiceCommandArgs["swf.ls.commands.OpenCompletionItems"]) => {
        editorInstance.setPosition({
          lineNumber: args.newCursorPosition.line + 1,
          column: args.newCursorPosition.character + 1,
        });
        editorInstance.trigger("OpenCompletionItemsAtTheBottom", "editor.action.triggerSuggest", {});
      }
    )!,
    "swf.ls.commands.OpenFunctionsWidget": editorInstance.addCommand(
      0,
      async (_ctx: editor.ICommandHandler, args: SwfLanguageServiceCommandArgs["swf.ls.commands.OpenFunctionsWidget"]) => {
        openWidget(editorInstance, {
          position: new Position(args.position.line, args.position.character),
          widgetId: "swf.functions.widget",
          backgroundColor: "lightgreen",
          domNodeHolder: {},
          onReady: () => {
            console.info("Opening functions widget..");
            return;
          },
          onClose: () => {
            return;
          },
        });
      }
    )!,
    "swf.ls.commands.OpenStatesWidget": editorInstance.addCommand(
      0,
      async (_ctx: editor.ICommandHandler, args: SwfLanguageServiceCommandArgs["swf.ls.commands.OpenStatesWidget"]) => {
        openWidget(editorInstance, {
          position: new Position(args.position.line, args.position.character),
          widgetId: "swf.states.widget",
          backgroundColor: "lightblue",
          domNodeHolder: {},
          onReady: () => {
            console.info("Opening states widget..");
            return;
          },
          onClose: () => {
            return;
          },
        });
      }
    )!,
  } as any;
}
