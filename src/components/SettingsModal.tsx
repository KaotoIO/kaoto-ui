import {
  fetchCompatibleDSLs,
  fetchIntegrationSourceCode,
  useIntegrationJsonContext,
  useIntegrationSourceContext,
  useSettingsContext,
} from '../api';
import { ISettings, IViewProps } from '../types';
import { usePrevious } from '../utils';
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
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useState } from 'react';

export interface ISettingsModal {
  handleCloseModal: () => void;
  handleUpdateViews: (newViews: IViewProps[]) => void;
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
  const [settings, setSettings] = useSettingsContext();
  const [localSettings, setLocalSettings] = useState<ISettings>(settings);
  const [integrationJson] = useIntegrationJsonContext();
  const [, setSourceCode] = useIntegrationSourceContext();
  const previousIntegrationJson = usePrevious(integrationJson);
  const previousName = usePrevious(localSettings.name);

  const { addAlert } = useAlert() || {};

  useEffect(() => {
    // update settings if there is a name change
    if (settings.name === previousName) return;
    setLocalSettings({ ...localSettings, name: settings.name });
  }, [settings.name]);

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

  const onChangeName = (newName: string) => {
    setLocalSettings({ ...localSettings, name: newName });
  };

  const onChangeNamespace = (newNamespace: string) => {
    setLocalSettings({ ...localSettings, namespace: newNamespace });
  };

  const onClose = () => {
    handleCloseModal();
  };

  const onSave = () => {
    setSettings(localSettings);
    let tmpInt = integrationJson;
    tmpInt.metadata = { ...localSettings };

    fetchIntegrationSourceCode(tmpInt)
      .then((source) => {
        if (typeof source === 'string') {
          setSourceCode(source);

          addAlert &&
            addAlert({
              title: 'Saved Settings',
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
            variant: AlertVariant.danger,
            description: 'Something went wrong, please try again later.',
          });
      });

    handleCloseModal();
  };

  return (
    <div className={'settings-modal'} data-testid={'settings-modal'}>
      <Modal
        actions={[
          <Button key="confirm" variant="primary" onClick={onSave}>
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
            fieldId="integration-name"
            helperText="Give your integration a fun name."
            isRequired
            label="Integration name"
          >
            <TextInput
              aria-describedby="integration-name-helper"
              id="integration-name"
              isRequired
              name="integration-name"
              onChange={onChangeName}
              type="text"
              value={localSettings.name}
            />
          </FormGroup>
          <FormGroup
            fieldId="namespace"
            helperText="Specify the namespace for your cluster."
            isRequired
            label="Namespace"
          >
            <TextInput
              aria-describedby="namespace-helper"
              id="namespace"
              isRequired
              name="namespace"
              onChange={onChangeNamespace}
              type="text"
              value={localSettings.namespace}
            />
          </FormGroup>
          <FormGroup
            label="Integration type"
            labelIcon={
              <Popover
                headerContent={'Integration type'}
                bodyContent={
                  <div>
                    <p>
                      The integration type determines what steps you have in the catalog. Not all
                      shown here will be available to you, as it depends on the steps you currently
                      are using.
                    </p>
                    <br />
                    <ul>
                      <li>
                        <b>Kamelets</b>: Choose this if you want to create a connection to be used
                        in an integration. Read more about Kamelets&nbsp;
                        <a
                          href={'https://camel.apache.org/camel-k/1.9.x/kamelets/kamelets.html'}
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
                        <b>Camel Routes</b> (advanced): Choose this if you want to create an
                        advanced integration.
                      </li>
                    </ul>
                  </div>
                }
              >
                <button
                  type="button"
                  aria-label="More info for integration type"
                  onClick={(e) => e.preventDefault()}
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
              onChange={(value) => {
                setLocalSettings({ ...localSettings, dsl: value });
              }}
              value={localSettings.dsl}
            >
              {availableDSLs.map((dsl, idx) => {
                return <FormSelectOption key={idx} value={dsl} label={dsl} />;
              })}
            </FormSelect>
          </FormGroup>
        </Form>
      </Modal>
    </div>
  );
};
