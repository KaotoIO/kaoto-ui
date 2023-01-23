// @ts-ignore
import svg from '../assets/images/kaoto.svg';
import { CodeEditorMode, IDsl, ISettings } from '@kaoto/types';
import { create } from 'zustand';

interface ISettingsStore {
  settings: ISettings;
  setSettings: (vals?: Partial<ISettings>) => void;
}

const initDsl: IDsl = {
  deployable: 'true',
  description: '',
  input: '',
  output: '',
  stepKinds: '',
  name: 'KameletBinding',
  validationSchema: '',
};

const initialSettings: ISettings = {
  description: '',
  dsl: initDsl,
  icon: svg,
  name: 'integration',
  namespace: '',
  editorMode: CodeEditorMode.FREE_EDIT,
};

export const useSettingsStore = create<ISettingsStore>((set) => ({
  settings: initialSettings,
  setSettings: (vals?: Partial<ISettings>) =>
    set((state) => ({
      settings: { ...state.settings, ...vals },
    })),
}));

export default useSettingsStore;
