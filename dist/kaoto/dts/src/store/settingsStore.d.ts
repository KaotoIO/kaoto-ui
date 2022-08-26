import { ISettings } from '../types';
interface ISettingsStore {
    settings: ISettings;
    setName: (val: string) => void;
    setSettings: (vals: ISettings) => void;
}
export declare const useSettingsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ISettingsStore>>;
export default useSettingsStore;
