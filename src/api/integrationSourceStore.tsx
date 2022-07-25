import create from 'zustand';

interface ISourceCodeStore {
  sourceCode: string;
  setSourceCode: (val?: string) => void;
}

export const useIntegrationSourceStore = create<ISourceCodeStore>((set) => ({
  sourceCode: '',
  setSourceCode: (val?: string) => set({ sourceCode: val }),
}));
