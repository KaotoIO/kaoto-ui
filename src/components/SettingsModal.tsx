import { fetchCapabilities, fetchCompatibleDSLs, fetchIntegrationSourceCode } from '@kaoto/api';
import { ValidationService } from '@kaoto/services';
import {
  useIntegrationJsonStore,
  useIntegrationSourceStore,
  useSettingsStore,
  useStepCatalogStore,
} from '@kaoto/store';
import { ICapabilities, ISettings } from '@kaoto/types';
import { getDescriptionIfExists, usePrevious } from '@kaoto/utils';
import {
  AlertVariant,
  Button,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
  Popover,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useState } from 'react';

export interface ISettingsModal {
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

/**
 * Contains the contents for the Settings modal.
 * @param handleCloseModal
 * @param handleUpdateViews
 * @param isModalOpen
 * @constructor
 */
export const SettingsModal = ({ handleCloseModal, isModalOpen }: ISettingsModal) => {
  const [availableDSLs, setAvailableDSLs] = useState<string[]>([]);
  const { settings, setSettings } = useSettingsStore((state) => state);
  const [localSettings, setLocalSettings] = useState<ISettings>(settings);
  const setStepCatalogDsl = useStepCatalogStore((state) => state.setDsl);
  const { integrationJson, updateIntegration } = useIntegrationJsonStore((state) => state);
  const { setSourceCode } = useIntegrationSourceStore();
  const previousIntegrationJson = usePrevious(integrationJson);
  const previousName = usePrevious(localSettings.name);
  const previousNamespace = usePrevious(localSettings.namespace);
  const [nameValidation, setNameValidation] = useState<
    'default' | 'warning' | 'success' | 'error' | undefined
  >('default');
  const [namespaceValidation, setNamespaceValidation] = useState<
    'default' | 'warning' | 'success' | 'error' | undefined
  >('default');

  const { addAlert } = useAlert() || {};

  useEffect(() => {
    // update settings if there is a name change
    if (settings.name !== previousName) {
      setLocalSettings({ ...localSettings, name: settings.name });
    }

    //update the description
    let description = getDescriptionIfExists(integrationJson);
    if (settings.description !== description) {
      if (description) {
        setLocalSettings({
          ...localSettings,
          description: description,
        });
      }
    }
    //update the DSL if changed
    if (settings.dsl.name === localSettings.dsl.name) return;
    onChangeDsl(settings.dsl.name);
  }, [settings.name, settings.description, settings.dsl]);

  useEffect(() => {
    // update settings with the default namespace fetched from the API
    if (settings.namespace === previousNamespace) return;
    setLocalSettings({ ...localSettings, namespace: settings.namespace });
  }, [settings.namespace]);

  useEffect(() => {
    if (previousIntegrationJson === integrationJson) return;
    // subsequent changes to the integration requires fetching
    // DSLs compatible with the specific integration
    fetchCompatibleDSLs({
      steps: integrationJson.steps,
    })
      .then((value) => {
        if (value) {
          setAvailableDSLs(value);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [integrationJson?.steps]);

  const onChangeDescription = (newDesc: string) => {
    setLocalSettings({ ...localSettings, description: newDesc });
  };

  const onChangeName = (newName: string) => {
    setLocalSettings({ ...localSettings, name: newName });

    if (ValidationService.isNameValidCheck(newName)) {
      setNameValidation('success');
    } else {
      setNameValidation('error');
    }
  };

  const onChangeDsl = (value: string) => {
    fetchCapabilities().then((capabilities: ICapabilities) => {
      capabilities.dsls.forEach((dsl) => {
        if (dsl.name === value) {
          setLocalSettings({ ...localSettings, dsl: dsl });
          setStepCatalogDsl(dsl.name);
          const tmpIntegration = { ...integrationJson, dsl: dsl.name };
          updateIntegration(tmpIntegration);
          return;
        }
      });
    });
  };

  const onChangeNamespace = (newNamespace: string) => {
    setLocalSettings({ ...localSettings, namespace: newNamespace });

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
    let tmpInt = integrationJson;
    tmpInt.metadata = { ...integrationJson.metadata, ...localSettings };

    fetchIntegrationSourceCode(tmpInt)
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
          isDisabled={namespaceValidation === 'error' || nameValidation === 'error'}
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
    >
      <Form>
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
            data-testid={'settings--description'}
            id="integration-description"
            name="integration-description"
            onChange={onChangeDescription}
            type="textarea"
            value={localSettings.description}
          />
        </FormGroup>
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
        <FormGroup
          label="Type"
          labelIcon={
            <Popover
              headerContent={'Type'}
              bodyContent={
                <div data-testid={'settings--integration-type-helper'}>
                  <p>
                    The integration type determines what steps you have in the catalog. Not all
                    shown here will be available to you, as it depends on the steps you currently
                    are using.
                  </p>
                  <br />
                  <ul>
                    <li>
                      <b>Kamelets</b>: Choose this if you want to create a connection to be used in
                      an integration. Read more about Kamelets&nbsp;
                      <a
                        href={'https://camel.apache.org/camel-k/latest/kamelets/kamelets.html'}
                        target={'_blank'}
                        rel={'noopener'}
                      >
                        here
                      </a>
                      .
                    </li>
                    <li>
                      <b>KameletBindings</b>: Choose this if you want to create an integration.
                    </li>
                    <li>
                      <b>Camel Routes</b> (advanced): Choose this if you want to create an advanced
                      integration.
                    </li>
                  </ul>
                </div>
              }
            >
              <button
                type="button"
                aria-label="More info for integration type"
                onClick={(e) => e.preventDefault()}
                data-testid={'settings--integration-type-helper-btn'}
                aria-describedby="dsl-type"
                className="pf-c-form__group-label-help"
              >
                <HelpIcon noVerticalAlign />
              </button>
            </Popover>
          }
          type="string"
          fieldId="dsl-type"
        >
          <FormSelect
            aria-label="Select Type"
            onChange={onChangeDsl}
            data-testid={'settings--integration-type'}
            value={localSettings.dsl.name}
          >
            {availableDSLs.map((dsl, idx) => {
              return (
                <FormSelectOption
                  key={idx}
                  value={dsl}
                  label={dsl}
                  data-testid={`settings--integration-type__${dsl}`}
                />
              );
            })}
          </FormSelect>
        </FormGroup>
      </Form>
    </Modal>
  );
};
