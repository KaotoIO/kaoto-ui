import { basename } from "path";
import { fetchIntegrationJson, fetchIntegrationSourceCode } from '@kaoto/api';
import { useIntegrationJsonStore, useSettingsStore, useTemporalIntegrationJsonStore } from '@kaoto/store';
import { IIntegration } from '@kaoto/types';
import isEqual from 'lodash.isequal';
import {
  createContext,
  forwardRef,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useCancelableEffect } from './hooks/useCancelableEffect';

// Create context
const KogitoEditorIntegrationContext = createContext({});

export enum ContentOperation {
  EDIT = "EDIT",
  UNDO = "UNDO",
  REDO = "REDO"
}

interface IKogitoEditorIntegrationProvider {
  children: ReactNode;
  content: string;
  contentPath: string;
  onContentChanged: (content: string, operation: ContentOperation) => void;
  onReady: () => void;
}

export interface KaotoIntegrationProviderRef {
  undo: () => void;
  redo: () => void;
}

function KogitoEditorIntegrationProviderInternal(
  { content, onContentChanged, onReady, children, contentPath }: IKogitoEditorIntegrationProvider,
  ref: Ref<KaotoIntegrationProviderRef>
) {
  const { settings, setSettings } = useSettingsStore();
  const { integrationJson, updateIntegration } = useIntegrationJsonStore((state) => state);

  // The history is used to keep a log of every change to the content. Then, this log is used to undo and redo content.
  const { undo, redo, pastStates } = useTemporalIntegrationJsonStore();

  const previousJson = useRef(integrationJson);
  const previousContent = useRef<string>();
  const initialIntegrationJson = useRef<IIntegration>();
  const [lastAction, setLastAction] = useState<ContentOperation.UNDO | ContentOperation.REDO | undefined>();

  // Set editor as Ready
  useEffect(() => {
    onReady();
  }, [onReady]);

  // Update file name
  useEffect(() => {
    setSettings({ name: basename(contentPath) });
  }, [contentPath, setSettings]);

  // Expose undo and redo callbacks to KaotoEditor.
  useImperativeHandle(
    ref,
    () => ({
      undo: () => {
        // Avoid undoing if inital state and first past state are different
        if (pastStates.length === 1 && !isEqual(pastStates[0], initialIntegrationJson.current)) {
          return;
        }
        undo();
        setLastAction(ContentOperation.UNDO);
      },
      redo: () => {
        redo();
        setLastAction(ContentOperation.REDO);
      },
    }),
    [pastStates, redo, undo]
  );

  // Update KaotoEditor content after an integrationJson change (the user interacted with the Kaoto UI).
  useCancelableEffect(
    useCallback(
      ({ canceled }) => {
        if (!integrationJson || isEqual(previousJson.current, integrationJson)) return;

        let tmpInt = integrationJson;
        tmpInt.metadata = { ...integrationJson.metadata, ...settings };
        fetchIntegrationSourceCode(tmpInt, settings.namespace).then((newSrc) => {
          if (canceled.get()) return;

          if (typeof newSrc === 'string' && newSrc !== previousContent.current && newSrc.length > 0) {
            if (lastAction) {
              onContentChanged(newSrc, lastAction);
              setLastAction(undefined);
            } else {
              onContentChanged(newSrc, ContentOperation.EDIT);
            }
            previousJson.current = integrationJson;
          }
        });
      }, [integrationJson, lastAction, onContentChanged, settings])
  );

  // Update the integrationJson to reflect an KaotoEditor content change (only if not triggered via Kaoto UI).
  useCancelableEffect(
    useCallback(
      ({ canceled }) => {
        if (previousContent.current === content) return;

        fetchIntegrationJson(content, settings.namespace)
          .then((res: IIntegration) => {
            if (canceled.get()) return;

            let tmpInt = res;
            tmpInt.metadata = { ...res.metadata, ...settings };
            updateIntegration(tmpInt);

            if (!initialIntegrationJson.current) {
              initialIntegrationJson.current = tmpInt;
            }

            previousContent.current = content;
          })
          .catch((e) => {
            console.error(e);
          });
      }, [content, settings, updateIntegration]
  ));

  return (
    <KogitoEditorIntegrationContext.Provider value>
      {children}
    </KogitoEditorIntegrationContext.Provider>
  );
}

export const KogitoEditorIntegrationProvider = forwardRef(KogitoEditorIntegrationProviderInternal);
