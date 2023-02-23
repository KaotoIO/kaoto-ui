// @ts-ignore
import svg from '../assets/images/kaoto.svg';
import LOCAL_STORAGE_EDITOR_THEME_KEY from '@kaoto/constants';
import { CodeEditorMode, IDsl, ISettings } from '@kaoto/types';
import { create } from 'zustand';

interface ISettingsStore {
  settings: ISettings;
  setSettings: (vals?: Partial<ISettings>) => void;
}

export const initDsl: IDsl = {
  deployable: 'false',
  description: '',
  input: '',
  output: '',
  stepKinds: '',
  name: 'Camel Route',
  validationSchema: '/v1/capabilities/Camel%20Route/schema',
};

export const initialSettings: ISettings = {
  description: '',
  dsl: initDsl,
  icon: svg,
  name: 'integration',
  namespace: '',
  editorIsLightMode: localStorage.getItem(LOCAL_STORAGE_EDITOR_THEME_KEY) === 'true',
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
