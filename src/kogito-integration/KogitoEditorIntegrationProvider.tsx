import { IIntegration } from '@kaoto/types';
import { fetchIntegrationJson, fetchIntegrationSourceCode } from '../api';
import { useIntegrationJsonStore, useSettingsStore } from '../store';
import {
  createContext,
  forwardRef,
  ReactNode,
  Ref,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import isEqual from 'lodash.isequal';
import { useStateHistory } from './hooks/useHistory';

/**
 * Create context
 */
 const KogitoEditorIntegrationContext = createContext({});

interface IKogitoEditorIntegrationProvider {
  children: ReactNode;
  content: string;
  updateContent: (content: string) => void;
}

export interface KaotoIntegrationProviderRef {
  undo: () => void;
  redo: () => void;
}

function KogitoEditorIntegrationProviderInternal({
  content,
  updateContent,
  children,
}: IKogitoEditorIntegrationProvider, ref: Ref<KaotoIntegrationProviderRef>) {
  const { settings } = useSettingsStore();
  const { integrationJson, updateIntegration } = useIntegrationJsonStore((state) => state);
  const { set, undo, redo, state } = useStateHistory<string>(content);
  const previousJson = useRef(integrationJson);
  const previousContent = useRef(content);
  const previousHistoryState = useRef(state);

  useImperativeHandle(ref, () => ({
    undo: () => {
      console.log("UNDOING");
      undo();
    },
    redo: () => {
      console.log("REDOING");
      redo();
    }
  }), [redo, undo]);

  useLayoutEffect(() => {
    set(content);
    fetchIntegrationJson(content, settings.namespace).then((res: IIntegration) => {
      let tmpInt = res;
      tmpInt.metadata = { ...res.metadata, ...settings };
      updateIntegration(tmpInt);
    }).catch((e) => {
      console.error(e);
    });
  }, []);

  useEffect(() => {
    if (content === previousHistoryState.current) return;
    set(content);
  }, [content]);

  useEffect(() => {
    if (!integrationJson || isEqual(previousJson.current, integrationJson)) return;
    let tmpInt = integrationJson;
    tmpInt.metadata = { ...integrationJson.metadata, ...settings };
    fetchIntegrationSourceCode(tmpInt, settings.namespace).then((newSrc) => {
      if (typeof newSrc === 'string' && newSrc !== previousContent.current && newSrc.length > 0) {
        updateContent(newSrc);
      }
    });
  }, [integrationJson, settings]);

  useEffect(() => {
    let tmpSource = state;
    fetchIntegrationJson(tmpSource, settings.namespace).then((res: IIntegration) => {
      let tmpInt = res;
      tmpInt.metadata = { ...res.metadata, ...settings };
      updateIntegration(tmpInt);
      updateContent(state);
    }).catch((e) => {
      console.error(e);
    });
  }, [state, settings]);

  return (
    <KogitoEditorIntegrationContext.Provider value>
      {children}
    </KogitoEditorIntegrationContext.Provider>
  );
}

export const KogitoEditorIntegrationProvider = forwardRef(KogitoEditorIntegrationProviderInternal);