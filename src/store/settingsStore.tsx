import { LOCAL_STORAGE_EDITOR_THEME_KEY, LOCAL_STORAGE_UI_THEME_KEY } from '@kaoto/constants';
import { CodeEditorMode, IDsl, ISettings } from '@kaoto/types';
import { create } from 'zustand';

const isUILightMode = localStorage.getItem(LOCAL_STORAGE_UI_THEME_KEY) ?? 'true';

interface ISettingsStore {
  settings: ISettings;
  setSettings: (vals?: Partial<ISettings>) => void;
}

export const initDsl: IDsl = {
  stepKinds: [
    'CAMEL-CONNECTOR',
    'EIP',
    'EIP-BRANCH',
    'CAMEL-REST-DSL',
    'CAMEL-REST-VERB',
    'CAMEL-REST-ENDPOINT',
  ],
  output: true,
  input: true,
  deployable: false,
  supportsMultipleFlows: true,
  supportsResourceDescription: false,
  vocabulary: {
    stepsName: 'Steps',
  },
  default: false,
  name: 'Camel Route',
  description: 'A camel route is a non deployable in cluster workflow of actions and steps.',
  validationSchema: '/v1/capabilities/Camel%20Route/schema',
};

export const initialSettings: ISettings = {
  description: '',
  dsl: initDsl,
  name: '',
  namespace: '',
  editorIsLightMode: localStorage.getItem(LOCAL_STORAGE_EDITOR_THEME_KEY) === 'true',
  uiLightMode: isUILightMode === 'true',
  editorMode: CodeEditorMode.FREE_EDIT,
  backendVersion: '',
  capabilities: [],
};

export const useSettingsStore = create<ISettingsStore>((set) => ({
  settings: initialSettings,
  setSettings: (vals?: Partial<ISettings>) =>
    set((state) => ({
      settings: { ...state.settings, ...vals },
    })),
}));
