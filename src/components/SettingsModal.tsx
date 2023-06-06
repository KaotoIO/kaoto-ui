import { usePrevious } from '../hooks';
import { fetchIntegrationSourceCode } from '@kaoto/api';
import { ValidationService } from '@kaoto/services';
import { useFlowsStore, useIntegrationSourceStore, useSettingsStore } from '@kaoto/store';
import { ISettings } from '@kaoto/types';
import {
  AlertVariant,
  Button,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

export interface ISettingsModal {
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

/**
 * Contains the contents for the Settings modal.
 * @param handleCloseModal
 * @param isModalOpen
 * @constructor
 */
export const SettingsModal = ({ handleCloseModal, isModalOpen }: ISettingsModal) => {
  const { settings, setSettings } = useSettingsStore((state) => state);
  const [localSettings, setLocalSettings] = useState<ISettings>(settings);
  const { flows, properties, metadata } = useFlowsStore(
    ({ flows, properties, metadata }) => ({
      flows,
      properties,
      metadata,
    }),
    shallow,
  );
  const { setSourceCode } = useIntegrationSourceStore();
  const previousNamespace = usePrevious(localSettings.namespace);
  const [namespaceValidation, setNamespaceValidation] = useState<
    'default' | 'warning' | 'success' | 'error' | undefined
  >('default');

  const { addAlert } = useAlert() || {};

  useEffect(() => {
    // update settings with the default namespace fetched from the API
    if (settings.namespace === previousNamespace) return;
    setLocalSettings((state) => ({ ...state, namespace: settings.namespace }));
  }, [settings.namespace]);

  const onChangeNamespace = (newNamespace: string) => {
    setLocalSettings((state) => ({ ...state, namespace: newNamespace }));

    if (ValidationService.isNameValidCheck(newNamespace)) {
      setNamespaceValidation('success');
    } else {
      setNamespaceValidation('error');
    }
  };

  const onClose = () => {
    handleCloseModal();
  };

  const onSave = () => {
    setSettings(localSettings);
    const updatedFlowWrapper = {
      flows: flows.map((flow) => ({
        ...flow,
        metadata: { ...flow.metadata, ...settings },
        dsl: settings.dsl.name,
      })),
      properties,
      metadata,
    };

    fetchIntegrationSourceCode(updatedFlowWrapper)
      .then((source) => {
        if (typeof source === 'string') {
          setSourceCode(source);

          addAlert &&
            addAlert({
              title: 'Saved Settings',
              dataTestId: 'settings-modal--alert__success',
              variant: AlertVariant.success,
              description: 'Configuration settings saved successfully.',
            });
        }
      })
      .catch((err) => {
        console.error(err);

        addAlert &&
          addAlert({
            title: 'Save Settings Unsuccessful',
            dataTestId: 'settings-modal--alert__danger',
            variant: AlertVariant.danger,
            description: 'Something went wrong, please try again later.',
          });
      });

    handleCloseModal();
  };

  return (
    <Modal
      actions={[
        <Button
          key="confirm"
          variant="primary"
          data-testid={'settings-modal--save'}
          onClick={onSave}
          isDisabled={namespaceValidation === 'error'}
        >
          Save
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={onClose}
          data-testid={'settings-modal--cancel'}
        >
          Cancel
        </Button>,
      ]}
      data-testid={'settings-modal'}
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      title="Settings"
      variant={ModalVariant.small}
      ouiaId="settings-modal"
    >
      <Form>
        <FormGroup
          fieldId="namespace"
          helperText="Specify the namespace for your cluster."
          helperTextInvalid="Must be lowercase and alphanumeric (dashes allowed)"
          isRequired
          label="Namespace"
          validated={namespaceValidation}
        >
          <TextInput
            aria-describedby="namespace-helper"
            id="namespace"
            isRequired
            name="namespace"
            onChange={onChangeNamespace}
            data-testid={'settings--namespace'}
            type="text"
            value={localSettings.namespace}
            validated={namespaceValidation}
            aria-invalid={namespaceValidation === 'error'}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};
