import {
  fetchAllDSLs,
  fetchCompatibleDSLsAndCRDs,
  useStepsAndViewsContext,
  useYAMLContext,
} from '../api';
import { ISettings } from '../types';
import {
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
import { useEffect, useRef, useState } from 'react';

export interface ISettingsModal {
  currentSettings: ISettings;
  handleCloseModal: () => void;
  handleSaveSettings: (newState?: any) => void;
  isModalOpen: boolean;
}

export interface IDSLProps {
  output: string;
  input: string;
  name: string;
  description: string;
  stepKinds: any;
}

export interface ICompatibleDSLsAndCRDs {
  crd: string;
  dsl: string;
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
  const availableDSLs = useRef<IDSLProps[]>([]);
  const compatibleDSLsAndCRDs = useRef<ICompatibleDSLsAndCRDs[]>([]);
  const [localSettings, setLocalSettings] = useState<ISettings>(currentSettings);
  const [viewData] = useStepsAndViewsContext();
  const [, setYAMLData] = useYAMLContext();

  useEffect(() => {
    // console.log('currentSettings changed.. ', currentSettings);
  }, [currentSettings]);

  useEffect(() => {
    const fetchContext = () => {
      fetchCompatibleDSLsAndCRDs({
        integrationName: currentSettings.integrationName,
        steps: viewData.steps,
        dsl: currentSettings.dsl,
      })
        .then((value) => {
          if (value) {
            // contains a list of compatible DSLs returned,
            // merged with their descriptions (fetched separately)
            const dslList: IDSLProps[] = [];

            // save compatible CRDs & DSLs for later use when saving settings
            compatibleDSLsAndCRDs.current = value;

            value.map((item: { crd: string; dsl: string }) => {
              availableDSLs.current.map((dsl) => {
                if (dsl.name === item.dsl) {
                  dslList.push(dsl);
                }
              });
            });

            availableDSLs.current = dslList;
          }
        })
        .catch((e) => {
          console.error(e);
        });
    };

    /**
     * fetch ALL DSLs and descriptions.
     * if the user has at least one step, then a separate
     * call is made to check compatible DSLs, with their
     * respective YAML/CRDs, and merged together.
     */
    fetchAllDSLs()
      .then((DSLs) => {
        availableDSLs.current = DSLs;
        if (viewData.steps.length !== 0) fetchContext();

        // setSettings({...settings, integrationName: });
      })
      .catch((e) => {
        console.error(e);
      });
  }, [currentSettings.dsl, currentSettings.integrationName, viewData]);

  const onChangeIntegrationName = (newName: string) => {
    setLocalSettings({ ...localSettings, integrationName: newName });
  };

  const onChangeNamespace = (newNamespace: string) => {
    setLocalSettings({ ...localSettings, namespace: newNamespace });
  };

  const onClose = () => {
    handleCloseModal();
  };

  const onSave = () => {
    const newDSL = compatibleDSLsAndCRDs.current.find(
      (i: ICompatibleDSLsAndCRDs) => i.dsl === localSettings.dsl
    );
    // update YAML with new compatible DSL/YAML
    // should I be doing this here though?
    if (newDSL) setYAMLData(newDSL.crd);

    handleSaveSettings(localSettings);
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
              onChange={onChangeIntegrationName}
              type="text"
              value={localSettings.integrationName}
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
              {availableDSLs.current.map((dsl, idx) => {
                return <FormSelectOption key={idx} value={dsl.name} label={dsl.name} />;
              })}
            </FormSelect>
          </FormGroup>
        </Form>
      </Modal>
    </div>
  );
};
