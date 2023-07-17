import { useCancelableEffect } from './hooks/useCancelableEffect';
import { fetchIntegrationJson, fetchIntegrationSourceCode } from '@kaoto/api';
import { useFlowsStore, useSettingsStore } from '@kaoto/store';
import { IFlowsWrapper } from '@kaoto/types';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import { basename } from 'path';
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
import { shallow } from 'zustand/shallow';

// Create context
const KogitoEditorIntegrationContext = createContext({});

export enum ContentOperation {
  EDIT = 'EDIT',
  UNDO = 'UNDO',
  REDO = 'REDO',
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
  ref: Ref<KaotoIntegrationProviderRef>,
) {
  const { currentDsl, capabilities, namespace, setSettings } = useSettingsStore(
    (state) => ({
      currentDsl: state.settings.dsl.name,
      capabilities: state.settings.capabilities,
      namespace: state.settings.namespace,
      setSettings: state.setSettings,
    }),
    shallow,
  );
  const { flows, properties, metadata, setFlowsWrapper } = useFlowsStore(
    ({ flows, properties, metadata, setFlowsWrapper }) => ({
      flows,
      properties,
      metadata,
      setFlowsWrapper,
    }),
    shallow,
  );

  // The history is used to keep a log of every change to the content. Then, this log is used to undo and redo content.
  const { undo, redo, pastStates } = useFlowsStore.temporal.getState();

  const previousFlowWrapper = useRef<IFlowsWrapper>(cloneDeep({ flows, properties, metadata }));
  const previousContent = useRef<string>();
  const initialIntegrationJson = useRef<IFlowsWrapper>();
  const [lastAction, setLastAction] = useState<
    ContentOperation.UNDO | ContentOperation.REDO | undefined
  >();

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
    [pastStates, redo, undo],
  );

  // Update the integrationJson to reflect a KaotoEditor content change (only if not triggered via Kaoto UI).
  useCancelableEffect(
    useCallback(
      ({ canceled }) => {
        if (previousContent.current === content) return;

        fetchIntegrationJson(content, namespace)
          .then((response) => {
            if (canceled.get()) return;

            const newDsl = response.flows?.[0].dsl ?? '';

            if (newDsl !== currentDsl) {
              const dsl = capabilities.find((dsl) => dsl.name === newDsl);
              setSettings({ dsl });
            }

            setFlowsWrapper(response);

            if (!initialIntegrationJson.current) {
              initialIntegrationJson.current = response;
            }

            previousContent.current = content;
          })
          .catch((e) => {
            console.error(e);
          });
      },
      [content],
    ),
  );

  // Update KaotoEditor content after an integrationJson change (the user interacted with the Kaoto UI).
  useCancelableEffect(
    useCallback(
      ({ canceled }) => {
        if (
          !flows ||
          (isEqual(previousFlowWrapper.current.flows, flows) &&
            isEqual(previousFlowWrapper.current.properties, properties) &&
            isEqual(previousFlowWrapper.current.metadata, metadata))
        )
          return;

        const updatedFlowWrapper: IFlowsWrapper = {
          flows: flows.map((flow) => ({
            ...flow,
            metadata: flow.metadata,
            dsl: currentDsl,
          })),
          properties,
          metadata,
        };

        fetchIntegrationSourceCode(updatedFlowWrapper, namespace).then((newSrc) => {
          if (canceled.get()) return;

          if (
            typeof newSrc === 'string' &&
            newSrc !== previousContent.current &&
            newSrc.length > 0
          ) {
            if (lastAction) {
              onContentChanged(newSrc, lastAction);
              setLastAction(undefined);
            } else {
              onContentChanged(newSrc, ContentOperation.EDIT);
            }
            previousFlowWrapper.current = updatedFlowWrapper;
          }
        });
      },
      [flows, properties, metadata],
    ),
  );

  return (
    <KogitoEditorIntegrationContext.Provider value>
      {children}
    </KogitoEditorIntegrationContext.Provider>
  );
}

export const KogitoEditorIntegrationProvider = forwardRef(KogitoEditorIntegrationProviderInternal);
