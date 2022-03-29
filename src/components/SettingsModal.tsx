import {
  Button,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { useState } from 'react';
import { ISettings } from '../pages/Dashboard';

export interface ISettingsModal {
  currentSettings: ISettings;
  handleCloseModal: () => void;
  handleSaveSettings: (newState?: any) => void;
  isModalOpen: boolean;
}

/**
 * Contains the contents for the Settings modal.
 * @param currentSettings
 * @param handleCloseModal
 * @param handleSaveSettings
 * @param isModalOpen
 * @constructor
 */
export const SettingsModal = ({
  currentSettings,
  handleCloseModal,
  handleSaveSettings,
  isModalOpen,
}: ISettingsModal) => {
  const [settings, setSettings] = useState<ISettings>(currentSettings);

  const onClose = () => {
    handleCloseModal();
  };

  return (
    <div className={'settings-modal'}>
      <Modal
        actions={[
          <Button
            key="confirm"
            variant="primary"
            onClick={() => {
              handleSaveSettings(settings);
            }}
          >
            Save
          </Button>,
          <Button key="cancel" variant="link" onClick={onClose}>
            Cancel
          </Button>,
        ]}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Settings"
        variant={ModalVariant.small}
      >
        <Form>
          <FormGroup
            label="Selection: "
            type="string"
            helperText={'You must choose a type of integration'}
            fieldId="selection"
          >
            <FormSelect
              aria-label="Select Type"
              onChange={(value) => {
                setSettings({ ...settings, dsl: value });
              }}
              value={settings.dsl}
            >
              <FormSelectOption key={1} value={'Kamelet'} label={'Kamelet'} />
              <FormSelectOption key={2} value={'KameletBinding'} label={'KameletBinding'} />
              <FormSelectOption key={3} value={'Camel Route'} label={'Camel Route'} />
            </FormSelect>
          </FormGroup>
        </Form>
      </Modal>
    </div>
  );
};
