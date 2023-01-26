import { ThemeSwitcher } from '@kaoto/layout';
import { useSettingsStore } from '@kaoto/store';
import {
  Form,
  FormSection,
  Modal,
  ModalVariant,
  PageHeaderTools,
  Switch,
} from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';

export interface IAppearanceModal {
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

const LOCAL_STORAGE_EDITOR_THEME_KEY = 'KAOTO_EDITOR_THEME_IS_LIGHT';

/**
 * Contains the contents for the Appearance modal.
 * @param handleCloseModal
 * @param isModalOpen
 * @constructor
 */
export const AppearanceModal = ({ handleCloseModal, isModalOpen }: IAppearanceModal) => {
  const storedTheme = localStorage.getItem(LOCAL_STORAGE_EDITOR_THEME_KEY);
  const { settings, setSettings } = useSettingsStore();
  // const localThemeisLight = !storedTheme || storedTheme === 'true';
  // const localThemeisLight = !storedTheme || storedTheme === 'false';
  // const localThemeisLight = !storedTheme || storedTheme === (!settings.editorIsDarkMode).toString();
  // const localThemeisLight = !storedTheme || storedTheme === (!settings.editorIsDarkMode).toString();
  // const [isLightTheme, setIsLightTheme] = useState(localThemeisLight);

  useEffect(() => {
    // loadThemeSetting(localThemeisLight);
    localStorage.setItem(
      LOCAL_STORAGE_EDITOR_THEME_KEY,
      storedTheme ?? settings.editorIsLightMode.toString()
    );
  }, []);

  const loadThemeSetting = (isThemeLight: boolean): void => {
    if (isThemeLight) {
      // setSettings({ ...settings, editorIsDarkMode: settings.isThemeLight });
    } else {
      // setSettings({ ...settings, editorIsDarkMode: settings.isThemeLight });
    }
  };

  const onToggleSwitchEditorTheme = (newCheckedState: boolean) => {
    setSettings({ ...settings, editorIsLightMode: newCheckedState });
    // setIsLightTheme(newCheckedState);
    loadThemeSetting(newCheckedState);
    localStorage.setItem(LOCAL_STORAGE_EDITOR_THEME_KEY, `${newCheckedState}`);
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      title="Appearance Settings"
      data-testid={'appearance-modal'}
      variant={ModalVariant.small}
    >
      <br />
      <Form>
        <FormSection title="Kaoto Light/Dark Mode" titleElement="h2">
          <ThemeSwitcher />
        </FormSection>
        <FormSection title={'Code Editor Light/Dark Mode'} titleElement={'h2'}>
          <PageHeaderTools className="header-tools">
            <MoonIcon size="md" />
            <Switch
              aria-label="theme-editor-switch"
              className="switch-theme"
              // isChecked={isLightTheme}
              isChecked={settings.editorIsLightMode}
              onChange={onToggleSwitchEditorTheme}
              data-testid={'appearance--theme-editor-switch'}
            />
            <SunIcon size="md" color="var(--pf-global--palette--gold-400)" />
          </PageHeaderTools>
        </FormSection>
      </Form>
    </Modal>
  );
};
