import isEqual from 'lodash.isequal';
import create from 'zustand';

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