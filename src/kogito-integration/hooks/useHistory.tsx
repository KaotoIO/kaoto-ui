import { Reducer, useCallback, useReducer } from "react";

type HistoryAction<T> = {
  type: "CLEAR",
  initialPresent: T
} | {
  type: "SET",
  newPresent: T
} | {
  type: "UNDO" | "REDO"
}

type HistoryState<T> = {
  past: T[],
  present: T,
  future: T[],
}

// Initial state that we pass into useReducer
const initialState = {
  // Array of previous state values updated each time we push a new state
  past: [],
  // Current state value
  present: null,
  // Will contain "future" state values if we undo (so we can redo)
  future: [],
};

// Our reducer function to handle state changes based on action
function reducer<T>(state: HistoryState<T>, action: HistoryAction<T>) {
  const { past, present, future } = state;
  console.log({ state, action });
  switch (action.type) {
    case "UNDO":
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    case "REDO":
      const next = future[0];
      const newFuture = future.length >= 2 ? future.slice(1) : [];
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    case "SET":
      const { newPresent } = action;
      if (newPresent === present) {
        return state;
      }
      return {
        past: [...past, present],
        present: newPresent,
        future: [],
      };
    case "CLEAR":
      const { initialPresent } = action;
      return {
        ...initialState,
        present: initialPresent,
      };
  }
};

// Hook
export function useStateHistory<T>(initialPresent: T) {
  const [state, dispatch] = useReducer<Reducer<HistoryState<T>, HistoryAction<T>>>(reducer, {
    ...initialState,
    present: initialPresent,
  });
  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;
  // Setup our callback functions
  // We memoize with useCallback to prevent unnecessary re-renders
  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: "UNDO" });
    }
  }, [canUndo, dispatch]);
  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: "REDO" });
    }
  }, [canRedo, dispatch]);
  const set = useCallback(
    (newPresent: T) => dispatch({ type: "SET", newPresent }),
    [dispatch]
  );
  const clear = useCallback(() => dispatch({ type: "CLEAR", initialPresent }), [
    dispatch,
  ]);
  // If needed we could also return past and future state
  return { state: state.present, set, undo, redo, clear, canUndo, canRedo };
};