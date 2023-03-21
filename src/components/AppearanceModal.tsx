import { useEffect } from 'react';

import { constants } from '@kaoto/constants';
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

import { ThemeSwitcher } from './ThemeSwitcher';


export interface IAppearanceModal {
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

/**
 * Contains the contents for the Appearance modal.
 * @param handleCloseModal
 * @param isModalOpen
 * @constructor
 */
const AppearanceModal = ({ handleCloseModal, isModalOpen }: IAppearanceModal) => {
  const storedTheme = localStorage.getItem(constants.LOCAL_STORAGE_EDITOR_THEME_KEY);
  const { settings, setSettings } = useSettingsStore();

  useEffect(() => {
    localStorage.setItem(
      constants.LOCAL_STORAGE_EDITOR_THEME_KEY,
      storedTheme ?? settings.editorIsLightMode.toString()
    );
  }, [settings.editorIsLightMode, storedTheme]);

  const onToggleSwitchEditorTheme = (newEditorCheckedState: boolean) => {
    setSettings({ ...settings, editorIsLightMode: newEditorCheckedState });
    localStorage.setItem(constants.LOCAL_STORAGE_EDITOR_THEME_KEY, `${newEditorCheckedState}`);
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
              className="switch-editor-theme"
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

export { AppearanceModal };
