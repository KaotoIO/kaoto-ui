import { IDeployment } from '../types';
interface IDeploymentStore {
    deployment: IDeployment;
    setDeploymentCrd: (val?: string) => void;
}
export declare const useDeploymentStore: import("zustand").UseBoundStore<import("zustand").StoreApi<IDeploymentStore>>;
export default useDeploymentStore;
