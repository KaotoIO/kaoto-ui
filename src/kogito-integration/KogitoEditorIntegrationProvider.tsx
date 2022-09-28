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
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

/**
 * Create context
 */
const KogitoEditorIntegrationContext = createContext({});

interface IKogitoEditorIntegrationProvider {
  children: ReactNode;
  content: string;
  onContentChanged: (content: string, operation: "EDIT" | "UNDO" | "REDO") => void;
  onReady: () => void;
}

export interface KaotoIntegrationProviderRef {
  undo: () => void;
  redo: () => void;
}

function KogitoEditorIntegrationProviderInternal(
  { content, onContentChanged, onReady, children }: IKogitoEditorIntegrationProvider,
  ref: Ref<KaotoIntegrationProviderRef>
) {
  const { settings } = useSettingsStore();
  const { integrationJson, updateIntegration } = useIntegrationJsonStore((state) => state);
  // const { set, undo, redo, state } = useStateHistory<string>(content);
  const previousJson = useRef(integrationJson);
  const previousContent = useRef(content);
  // const previousHistoryState = useRef(state);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useImperativeHandle(
    ref,
    () => ({
      undo: () => {
        console.log('UNDOING');
        // undo();
      },
      redo: () => {
        console.log('REDOING');
        // redo();
      },
    }),
    []
  );

  // useLayoutEffect(() => {
  //   // set(content);
  //   console.log({ state: "useLayoutEffect", content });
  //   fetchIntegrationJson(content, settings.namespace)
  //     .then((res: IIntegration) => {
  //       let tmpInt = res;
  //       tmpInt.metadata = { ...res.metadata, ...settings };
  //       updateIntegration(tmpInt);
  //     })
  //     .catch((e) => {
  //       console.error(e);
  //     });
  // }, []);

  // useEffect(() => {
  //   if (content === previousHistoryState.current) return;
  //   set(content);
  // }, [content]);

  useEffect(() => {
    if (!integrationJson || isEqual(previousJson.current, integrationJson)) return;
    console.log({ state: "useEffect", integrationJson });
    let tmpInt = integrationJson;
    tmpInt.metadata = { ...integrationJson.metadata, ...settings };
    fetchIntegrationSourceCode(tmpInt, settings.namespace).then((newSrc) => {
      if (typeof newSrc === 'string' && newSrc !== previousContent.current && newSrc.length > 0) {
        onContentChanged(newSrc, "EDIT");
      }
    });
  }, [integrationJson, onContentChanged, settings]);

  useEffect(() => {
    let tmpSource = content;
    console.log({ state: "useEffect", content });
    fetchIntegrationJson(tmpSource, settings.namespace)
      .then((res: IIntegration) => {
        let tmpInt = res;
        tmpInt.metadata = { ...res.metadata, ...settings };
        updateIntegration(tmpInt);
        // onContentChanged(state);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [content, settings]);

  return (
    <KogitoEditorIntegrationContext.Provider value>
      {children}
    </KogitoEditorIntegrationContext.Provider>
  );
}

export const KogitoEditorIntegrationProvider = forwardRef(KogitoEditorIntegrationProviderInternal);
