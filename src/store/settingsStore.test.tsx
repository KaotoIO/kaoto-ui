import { initialSettings, useSettingsStore } from './settingsStore';
import { act, renderHook } from '@testing-library/react';

describe('settingsStore', () => {
  it('setSettings', () => {
    const { result } = renderHook(() => useSettingsStore());
    expect(result.current.settings).toEqual(initialSettings);

    act(() => {
      result.current.setSettings({
        ...initialSettings,
        description: 'The best description ever',
        editorIsLightMode: false,
        name: 'Goji Berry',
        namespace: 'KameletBinding',
      });
    });

    expect(result.current.settings.description).toEqual('The best description ever');
    expect(result.current.settings.dsl).toEqual(initialSettings.dsl);
    expect(result.current.settings.editorIsLightMode).toBeFalsy();
    expect(result.current.settings.name).toEqual('Goji Berry');
    expect(result.current.settings.namespace).toEqual('KameletBinding');
  });

  it('setBackendVersion', () => {
    const { result } = renderHook(() => useSettingsStore());
    expect(result.current.backendVersion).toEqual('');

    act(() => {
      result.current.setBackendVersion('1.0-test');
    });

    expect(result.current.backendVersion).toEqual('1.0-test');
  });
});
