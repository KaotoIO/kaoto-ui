// @ts-ignore
import initDsl from './settingsStore';
import { IStepProps } from '@kaoto/types';
import { create } from 'zustand';

interface IStepCatalogStore {
  dsl: string;
  stepCatalog: IStepProps[];
  setDsl: (dsl: string) => void;
  setStepCatalog: (vals: IStepProps[]) => void;
}

export const initialStepCatalog: IStepProps[] = [];
export const useStepCatalogStore = create<IStepCatalogStore>((set) => ({
  dsl: initDsl.name,
  stepCatalog: initialStepCatalog,
  setDsl: (dsl: string) => {
    set({ dsl: dsl, stepCatalog: [] });
  },
  setStepCatalog: (vals: IStepProps[]) => {
    set({ stepCatalog: vals });
  },
}));

export default useStepCatalogStore;
