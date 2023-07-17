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
  TextArea,
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
  const { settings, setSettings } = useSettingsStore(
    ({ settings, setSettings }) => ({
      settings,
      setSettings,
    }),
    shallow,
  );
  const [localSettings, setLocalSettings] = useState<ISettings>(settings);
  const { flows, properties, metadata, setMetadata } = useFlowsStore(
    ({ flows, properties, metadata, setMetadata }) => ({
      flows,
      properties,
      metadata,
      setMetadata,
    }),
    shallow,
  );
  const { setSourceCode } = useIntegrationSourceStore();
  const [nameValidation, setNameValidation] = useState<
    'default' | 'warning' | 'success' | 'error' | undefined
  >('default');
  const previousNamespace = usePrevious(localSettings.namespace);
  const [namespaceValidation, setNamespaceValidation] = useState<
    'default' | 'warning' | 'success' | 'error' | undefined
  >('default');

  const { addAlert } = useAlert() || {};

  useEffect(() => {
    const name = metadata.name ? (metadata.name as string) : '';
    if (settings.name !== name) {
      setLocalSettings((state) => ({ ...state, name }));
    }
  }, [metadata.name]);

  useEffect(() => {
    const description = metadata.description ? (metadata.description as string) : '';
    if (settings.description !== description) {
      setLocalSettings((state) => ({ ...state, description }));
    }
  }, [metadata.description]);

  useEffect(() => {
    // update settings with the default namespace fetched from the API
    if (settings.namespace === previousNamespace) return;
    setLocalSettings((state) => ({ ...state, namespace: settings.namespace }));
  }, [settings.namespace]);

  const onChangeDescription = (newDesc: string) => {
    setLocalSettings((state) => ({ ...state, description: newDesc }));
  };

  const onChangeName = (newName: string) => {
    setLocalSettings((state) => ({ ...state, name: newName }));

    if (ValidationService.isNameValidCheck(newName)) {
      setNameValidation('success');
    } else {
      setNameValidation('error');
    }
  };

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
    if (localSettings.name != null) {
      setMetadata('name', localSettings.name);
    }
    if (localSettings.description != null) {
      setMetadata('description', localSettings.description);
    }
    const updatedFlowWrapper = {
      flows: flows.map((flow) => ({
        ...flow,
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
        {settings.dsl.supportsResourceDescription && (
          <>
            <FormGroup
              fieldId="integration-name"
              helperTextInvalid="Must be lowercase and alphanumeric (dashes allowed)"
              validated={nameValidation}
              isRequired
              label="Name"
            >
              <TextInput
                aria-describedby="integration-name-helper"
                data-testid={'settings--integration-name'}
                id="integration-name"
                isRequired
                name="integration-name"
                onChange={onChangeName}
                type="text"
                value={localSettings.name}
                validated={nameValidation}
                aria-invalid={nameValidation === 'error'}
              />
            </FormGroup>
            <FormGroup fieldId="integration-description" label="Description">
              <TextArea
                aria-describedby="integration-description-helper"
                data-testid={'settings--integration-description'}
                id="integration-description"
                name="integration-description"
                onChange={onChangeDescription}
                type="textarea"
                value={localSettings.description}
              />
            </FormGroup>
          </>
        )}
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
