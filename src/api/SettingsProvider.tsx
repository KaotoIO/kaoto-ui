// @ts-ignore
import svg from '../assets/images/kaoto.svg';
import { ISettings } from '../types';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

interface ISettingsProvider {
  initialState?: ISettings;
  children: ReactNode;
}

export type IUseSettings = [ISettings, Dispatch<SetStateAction<ISettings>>];

const initialOrChangedSettings: ISettings = {
  description: '',
  dsl: 'KameletBinding',
  icon: svg,
  name: 'integration',
  namespace: 'default',
};

/**
 * Provider
 * @param initialState
 * @param children
 * @constructor
 */
function SettingsProvider({ initialState, children }: ISettingsProvider) {
  const [settings, setSettings] = useState<ISettings>({
    ...initialOrChangedSettings,
    ...initialState,
  });

  return (
    <settingsContext.Provider value={[settings, setSettings]}>{children}</settingsContext.Provider>
  );
}

/**
 * Create context
 */
const settingsContext = createContext<IUseSettings>([initialOrChangedSettings, () => null]);

/**
 * Convenience hook
 */
function useSettingsContext() {
  const context = useContext(settingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider!');
  }
  return context;
}

export { SettingsProvider, useSettingsContext };
