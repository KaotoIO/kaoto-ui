import svg from '../assets/images/kaoto.svg';
import { LOCAL_STORAGE_EDITOR_THEME_KEY, LOCAL_STORAGE_UI_THEME_KEY } from '@kaoto/constants';
import { CodeEditorMode, IDsl, ISettings } from '@kaoto/types';
import { create } from 'zustand';

const isUILightMode = localStorage.getItem(LOCAL_STORAGE_UI_THEME_KEY) ?? 'true';

interface ISettingsStore {
  settings: ISettings;
  setSettings: (vals?: Partial<ISettings>) => void;
  backendVersion: string;
  setBackendVersion: (backendVersion: string) => void;
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
  uiLightMode: isUILightMode === 'true',
  editorMode: CodeEditorMode.FREE_EDIT,
  useMultipleFlows: true,
};

export const useSettingsStore = create<ISettingsStore>((set) => ({
  settings: initialSettings,
  setSettings: (vals?: Partial<ISettings>) =>
    set((state) => ({
      settings: { ...state.settings, ...vals },
    })),
  backendVersion: '',
  setBackendVersion: (backendVersion: string) => {
    set(() => ({
      backendVersion: backendVersion,
    }));
  },
}));

export default useSettingsStore;
