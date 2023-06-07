import { create } from 'zustand';

interface ISourceCodeStore {
  sourceCode: string;
  syncedSourceCode: string;
  setSourceCode: (val?: string) => void;
  setSyncedSourceCode: (val?: string) => void;
}

export const useIntegrationSourceStore = create<ISourceCodeStore>((set) => ({
  sourceCode: '',
  syncedSourceCode: '',
  setSourceCode: (val?: string) => set({ sourceCode: val }),
  setSyncedSourceCode: (val?: string) => set({ syncedSourceCode: val }),
}));
