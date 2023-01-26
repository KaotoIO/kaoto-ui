import './ThemeSwitcher.css';
import { PageHeaderTools, Switch } from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useEffect, useState } from 'react';

const THEME_DARK_CLASS = 'pf-theme-dark';
const LOCAL_STORAGE_THEME_KEY = 'KAOTO_UI_THEME_IS_LIGHT';

export const ThemeSwitcher = () => {
  const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
  const localThemeisLight = !storedTheme || storedTheme === 'true';
  const [isLightTheme, setIsLightTheme] = useState(localThemeisLight);
  const htmlTagElement = document.documentElement;

  useEffect(() => {
    loadThemeClass(localThemeisLight);
  }, []);

  const loadThemeClass = (isThemeLight: boolean) => {
    if (isThemeLight) {
      htmlTagElement?.classList.remove(THEME_DARK_CLASS);
    } else {
      htmlTagElement?.classList.add(THEME_DARK_CLASS);
    }
  };

  const onToggleSwitchTheme = (newCheckedState: boolean) => {
    setIsLightTheme(newCheckedState);
    loadThemeClass(newCheckedState);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, `${newCheckedState}`);
  };

  return (
    <PageHeaderTools className="header-tools">
      <MoonIcon size="md" />
      <Switch
        aria-label="theme-switch"
        className="switch-theme"
        isChecked={isLightTheme}
        onChange={onToggleSwitchTheme}
        data-testid={'appearance--theme-switch'}
      />
      <SunIcon size="md" color="var(--pf-global--palette--gold-400)" />
    </PageHeaderTools>
  );
};
