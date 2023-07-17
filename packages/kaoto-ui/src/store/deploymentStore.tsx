import { initDsl, initialSettings } from './settingsStore';
import { IDeployment } from '@kaoto/types';
import { create } from 'zustand';

interface IDeploymentStore {
  deployment: IDeployment;
  setDeploymentCrd: (val?: string) => void;
}

const initialDeployment: IDeployment = {
  crd: '',
  date: '',
  errors: [],
  name: initialSettings.name,
  namespace: initialSettings.namespace,
  status: 'Stopped',
  type: initDsl.name,
};

export const useDeploymentStore = create<IDeploymentStore>((set) => ({
  deployment: initialDeployment,
  setDeploymentCrd: (val?: string) =>
    set((state) => ({
      deployment: { ...state.deployment, crd: val },
    })),
}));
