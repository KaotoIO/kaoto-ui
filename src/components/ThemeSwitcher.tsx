import './ThemeSwitcher.css';
import { LOCAL_STORAGE_UI_THEME_KEY } from '@kaoto/constants';
import { PageHeaderTools, Switch } from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useSettingsStore } from '@kaoto/store';

export const ThemeSwitcher = () => {
  const { settings, setSettings } = useSettingsStore();

  const onToggleSwitchTheme = (newUiCheckedState: boolean) => {
    setSettings({ ...settings, uiLightMode: newUiCheckedState });
    localStorage.setItem(LOCAL_STORAGE_UI_THEME_KEY, `${newUiCheckedState}`);
  };

  return (
    <PageHeaderTools className="header-tools">
      <MoonIcon size="md" />
      <Switch
        aria-label="theme-ui-switch"
        className="switch-ui-theme"
        isChecked={settings.uiLightMode}
        onChange={onToggleSwitchTheme}
        data-testid={'appearance--theme-ui-switch'}
      />
      <SunIcon size="md" color="var(--pf-global--palette--gold-400)" />
    </PageHeaderTools>
  );
};
