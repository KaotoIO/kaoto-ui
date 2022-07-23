import { IDeployment } from '../types';
import create from 'zustand';

interface IDeploymentStore {
  deployment: IDeployment;
  setDeploymentCrd: (val?: string) => void;
}

const initialDeployment: IDeployment = {
  crd: '',
  date: '',
  errors: [],
  name: 'integration',
  namespace: 'default',
  status: 'Stopped',
  type: 'KameletBinding',
};

export const useDeploymentStore = create<IDeploymentStore>((set) => ({
  deployment: initialDeployment,
  setDeploymentCrd: (val?: string) =>
    set((state) => ({
      deployment: { ...state.deployment, crd: val },
    })),
}));
