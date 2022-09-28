import { basename } from "path";
import { fetchIntegrationJson, fetchIntegrationSourceCode } from '../api';
import { useIntegrationJsonStore, useSettingsStore } from '../store';
import { useStateHistory } from './hooks/useHistory';
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
};

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
  const { set, undo, redo, state } = useStateHistory<string>(content);

  const previousJson = useRef(integrationJson);
  const previousContent = useRef<string>();
  const previousStateContent = useRef<string>();
  const [lastAction, setLastAction] = useState<ContentOperation.UNDO | ContentOperation.REDO | undefined>();

  // Set editor as Ready
  useEffect(() => {
    onReady();
  }, [onReady]);

  // Update file name
  useEffect(() => {
    setSettings({ name: basename(contentPath) });
  }, [contentPath, setSettings]);

  // Update content after an Undo or Redo action, clearing lastAction state so that it doesn't get triggered repeatedly before another action.
  useEffect(() => {
    if (lastAction) {
      onContentChanged(state, lastAction);
      setLastAction(undefined);
      previousStateContent.current = state;
    }
  }, [lastAction, onContentChanged, state]);

  // Expose undo and redo callbacks to KaotoEditor.
  useImperativeHandle(
    ref,
    () => ({
      undo: () => {
        undo();
        setLastAction(ContentOperation.UNDO);
      },
      redo: () => {
        redo();
        setLastAction(ContentOperation.REDO);
      },
    }),
    [redo, undo]
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
            onContentChanged(newSrc, ContentOperation.EDIT);
            previousJson.current = integrationJson;
          }
        });
      }, [integrationJson, onContentChanged, settings])
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

            if (previousStateContent.current !== content) {
              set(content);
            }

            previousContent.current = content;
          })
          .catch((e) => {
            console.error(e);
          });
      }, [content, set, settings, updateIntegration]
  ));

  return (
    <KogitoEditorIntegrationContext.Provider value>
      {children}
    </KogitoEditorIntegrationContext.Provider>
  );
}

export const KogitoEditorIntegrationProvider = forwardRef(KogitoEditorIntegrationProviderInternal);
