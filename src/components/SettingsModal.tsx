import {
  Button,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { useEffect, useRef, useState } from 'react';
import { ISettings } from '../pages/Dashboard';
import {
  fetchAllDSLs,
  fetchCompatibleDSLsAndCRDs,
  useStepsAndViewsContext,
  useYAMLContext,
} from '../api';

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
  // possible DSLs with their descriptions
  const [DSLs, setDSLs] = useState<IDSLProps[]>([]);
  const [settings, setSettings] = useState<ISettings>(currentSettings);
  const [viewData] = useStepsAndViewsContext();
  const [, setYAMLData] = useYAMLContext();

  // compatible DSLs (no description) & CRDs/YAML
  const compatibleDSLsAndCRDs = useRef<ICompatibleDSLsAndCRDs[]>([]);

  useEffect(() => {
    const fetchContext = () => {
      fetchCompatibleDSLsAndCRDs({ steps: viewData.steps, type: settings.dsl })
        .then((value) => {
          if (value) {
            // contains a list of compatible DSLs returned,
            // merged with their descriptions (fetched separately)
            const dslList: IDSLProps[] = [];

            // save compatible CRDs & DSLs for later use when saving settings
            compatibleDSLsAndCRDs.current = value;

            value.map((item: { crd: string; dsl: string }) => {
              DSLs.map((dsl) => {
                if (dsl.name === item.dsl) {
                  dslList.push(dsl);
                }
              });
            });

            setDSLs(dslList);
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
      .then((dsls) => {
        setDSLs(dsls);
        if (viewData.steps.length !== 0) fetchContext();
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const onClose = () => {
    handleCloseModal();
  };

  const onSave = () => {
    const newDSL = compatibleDSLsAndCRDs.current.find(
      (i: ICompatibleDSLsAndCRDs) => i.dsl === settings.dsl
    );

    // update YAML with new compatible DSL/YAML
    if (newDSL) setYAMLData(newDSL.crd);
    handleSaveSettings(settings);
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
            label="Selection: "
            type="string"
            helperText={'You must choose what you want to build'}
            fieldId="selection"
          >
            <FormSelect
              aria-label="Select Type"
              onChange={(value) => {
                setSettings({ ...settings, dsl: value });
              }}
              value={settings.dsl}
            >
              {DSLs.map((dsl, idx) => {
                return <FormSelectOption key={idx} value={dsl.name} label={dsl.name} />;
              })}
            </FormSelect>
          </FormGroup>
        </Form>
      </Modal>
    </div>
  );
};
