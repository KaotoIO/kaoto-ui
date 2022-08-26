import { IIntegration, IStepProps, IViewProps } from '../types';
interface IIntegrationJsonStore {
    addStep: (newStep: IStepProps) => void;
    deleteIntegration: () => void;
    deleteStep: (index: number) => void;
    insertStep: (newStep: IStepProps, index: number) => void;
    integrationJson: IIntegration;
    updateIntegration: (newInt?: any) => void;
    replaceStep: (newStep: IStepProps, oldStepIndex?: number) => void;
    setViews: (views: IViewProps[]) => void;
    views: IViewProps[];
}
export declare const useIntegrationJsonStore: import("zustand").UseBoundStore<import("zustand").StoreApi<IIntegrationJsonStore>>;
export default useIntegrationJsonStore;
