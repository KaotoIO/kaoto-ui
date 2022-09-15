import { IIntegration } from '@kaoto/types';
import { fetchIntegrationJson, fetchIntegrationSourceCode } from '../api';
import { useIntegrationJsonStore, useSettingsStore } from '@kaoto/store';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';

// export default function useUndoableState(init) {
//   const [states, setStates] = useState([init]); // Used to store history of all states
//   const [index, setIndex] = useState(0); // Index of current state within `states`
//   const state = useMemo(() => states[index], [states, index]); // Current state
//   const setState = (value) => {
//     // Use lodash isEqual to check for deep equality
//     // If state has not changed, return to avoid triggering a re-render
//     if (isEqual(state, value)) {
//       return;
//     }
//     const copy = states.slice(0, index + 1); // This removes all future (redo) states after current index
//     copy.push(value);
//     setStates(copy);
//     setIndex(copy.length - 1);
//   };
//   // Clear all state history
//   const resetState = (init) => {
//     setIndex(0);
//     setStates([init]);
//   };
//   // Allows you to go back (undo) N steps
//   const goBack = (steps = 1) => {
//     setIndex(Math.max(0, Number(index) - (Number(steps) || 1)));
//   };
//   // Allows you to go forward (redo) N steps
//   const goForward = (steps = 1) => {
//     setIndex(Math.min(states.length - 1, Number(index) + (Number(steps) || 1)));
//   };
//   return {
//     state,
//     setState,
//     resetState,
//     index,
//     lastIndex: states.length - 1,
//     goBack,
//     goForward,
//   };
// }

interface IKogitoEditorIntegrationProvider {
  children: ReactNode;
  content?: string;
  updateContent?: (content: string) => void;
  setUndoRedoCallbacks?: (undoCallback: () => void, redoCallback: () => void) => void;
}

export function KogitoEditorIntegrationProvider({
  content,
  updateContent,
  setUndoRedoCallbacks,
  children,
}: IKogitoEditorIntegrationProvider) {
  const { settings } = useSettingsStore();
  const { integrationJson, updateIntegration } = useIntegrationJsonStore((state) => state);
  // const [contentJson, setContentJson] = useState<IIntegration>(integrationJson);
  // const [contentJsonHistory, setContentJsonHistory] = useState<IIntegration[]>([integrationJson]);
  const previousContentString = useRef(content);
  const previousIntegrationJson = useRef(integrationJson);

  // useEffect(() => {
  //   setContentJson((currentContentJson) => {
  //     if (JSON.stringify(currentContentJson) !== JSON.stringify(integrationJson)) {
  //       return integrationJson;
  //     }
  //     return currentContentJson;
  //   });
  // }, [integrationJson]);

  useEffect(() => {
    if (!updateContent || JSON.stringify(integrationJson) === JSON.stringify(previousIntegrationJson.current)) {
      return;
    }
    fetchIntegrationSourceCode(integrationJson, settings.namespace).then((newSrc) => {
      if (typeof newSrc === 'string' && newSrc !== previousContentString.current) {
        console.log('Updating Kogito file content from Kaoto');
        previousContentString.current = newSrc;
        updateContent(newSrc);
        previousIntegrationJson.current = integrationJson;
      }
    });
  }, [integrationJson, settings.namespace, updateContent]);

  // const handleFileContentChanges = useCallback(
  //   (newContent?: string) => {
  //     if (!newContent) {
  //       return;
  //     }

  //     console.log(newContent);

  //     previousContentString.current = newContent;

  //     fetchIntegrationJson(newContent, settings.dsl)
  //       .then((res: IIntegration) => {
  //         let tmpInt = res;
  //         tmpInt.metadata = { ...res.metadata, ...settings };
  //         console.log('Updating Kaoto from Kogito file content');
  //         updateIntegration(tmpInt);
  //       })
  //       .catch((e) => {
  //         console.error(e);
  //       });
  //   },
  //   [settings, updateIntegration]
  // );

  // const debouncedFileContentUpdate = useDebouncedCallback((value: string) => {
  //   handleFileContentChanges(value);
  // }, 1000);

  useEffect(() => {
    if (!content || content === previousContentString.current) {
      return;
    }

    previousContentString.current = content;

    fetchIntegrationJson(content, settings.dsl)
      .then((res: IIntegration) => {
        let tmpInt = res;
        tmpInt.metadata = { ...res.metadata, ...settings };
        console.log('Updating Kaoto from Kogito file content');
        updateIntegration(tmpInt);
      })
      .catch((e) => {
        console.error(e);
      });

    // debouncedFileContentUpdate(content);
  }, [content, settings, updateIntegration]);

  return (
    <KogitoEditorIntegrationContext.Provider value={{ setUndoRedoCallbacks }}>
      {children}
    </KogitoEditorIntegrationContext.Provider>
  );
}

/**
 * Create context
 */
const KogitoEditorIntegrationContext = createContext<
  Omit<IKogitoEditorIntegrationProvider, 'children'>
>({});

/**
 * Convenience hook
 */
export function useKogitoEditorIntegration() {
  const context = useContext(KogitoEditorIntegrationContext) ?? {};
  return context;
}

export function useSetUndoRedoCallbacks(undoCallback: () => void, redoCallback: () => void) {
  const { setUndoRedoCallbacks } = useKogitoEditorIntegration();

  if (!setUndoRedoCallbacks) {
    return;
  }

  setUndoRedoCallbacks(undoCallback, redoCallback);
}
