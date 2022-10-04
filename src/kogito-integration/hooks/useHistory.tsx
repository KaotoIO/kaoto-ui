// import { Reducer, useCallback, useMemo, useReducer } from "react";
import isEqual from 'lodash.isequal';
import create from 'zustand';

// type HistoryAction<T> = {
//   type: "CLEAR",
//   initialPresent: T
// } | {
//   type: "SET",
//   newPresent: T
// } | {
//   type: "UNDO" | "REDO"
// }

// type HistoryState<T> = {
//   past: T[],
//   present: T,
//   future: T[],
// }

// // Initial state that we pass into useReducer
// const initialState = {
//   // Array of previous state values updated each time we push a new state
//   past: [],
//   // Current state value
//   present: null,
//   // Will contain "future" state values if we undo (so we can redo)
//   future: [],
// };

// // Our reducer function to handle state changes based on action
// function reducer<T>(state: HistoryState<T>, action: HistoryAction<T>) {
//   const { past, present, future } = state;
//   switch (action.type) {
//     case "UNDO":
//       const previous = past[past.length - 1];
//       const newPast = past.slice(0, past.length - 1);
//       return {
//         past: newPast,
//         present: previous,
//         future: [present, ...future],
//       };
//     case "REDO":
//       const next = future[0];
//       const newFuture = future.slice(1);
//       return {
//         past: [...past, present],
//         present: next,
//         future: newFuture,
//       };
//     case "SET":
//       const { newPresent } = action;
//       if (newPresent === present) {
//         return state;
//       }
//       return {
//         past: [...past, present],
//         present: newPresent,
//         future: [],
//       };
//     case "CLEAR":
//       const { initialPresent } = action;
//       return {
//         ...initialState,
//         present: initialPresent,
//       };
//   }
// };

// // Hook
// export function useStateHistory<T>(initialPresent: T) {
//   const [state, dispatch] = useReducer<Reducer<HistoryState<T>, HistoryAction<T>>>(reducer, {
//     ...initialState,
//     present: initialPresent,
//   });
//   const canUndo = useMemo(() => state.past.length > 0, [state]);
//   const canRedo = useMemo(() => state.future.length > 0, [state]);
//   // Setup our callback functions
//   // We memoize with useCallback to prevent unnecessary re-renders
//   const undo = useCallback(() => {
//     if (canUndo) {
//       dispatch({ type: "UNDO" });
//     }
//   }, [canUndo, dispatch]);
//   const redo = useCallback(() => {
//     if (canRedo) {
//       dispatch({ type: "REDO" });
//     }
//   }, [canRedo, dispatch]);
//   const set = useCallback(
//     (newPresent: T) => dispatch({ type: "SET", newPresent }),
//     [dispatch]
//   );
//   const clear = useCallback(() => dispatch({ type: "CLEAR", initialPresent }), [initialPresent]);
//   // If needed we could also return past and future state
//   return { state: state.present, set, undo, redo, clear, canUndo, canRedo, history: state };
// };

type HistoryState<T> = {
  past: T[],
  present: T,
  future: T[],
  addState: (newPresent: T) => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
}

export function createUseStateHistory<T>(initialState: T) {
  return create<HistoryState<T>>((set) => ({
    past: [],
    present: initialState,
    future: [],
    addState: (newPresent: T) => set((state) => {
      const { present, past } = state; 
      if (isEqual(newPresent, present)) {
        return state;
      }
      return {
        past: [...past, present],
        present: newPresent,
        future: [],
      };
    }),
    clear: () => set(() => ({
      past: [],
      present: initialState,
      future: []
    })),
    undo: () => set((state) => {
      const { past, present, future } = state;

      if (past.length <= 0) return {};

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }),
    redo: () => set((state) => {
      const { past, present, future } = state;
      if ( future.length <= 0) return {};

      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    })
  }));
};


export const useStateHistory = createUseStateHistory<string>("");