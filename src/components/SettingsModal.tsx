import {
  Button,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { ISettings } from '../pages/Dashboard';
import { fetchAllDSLs, fetchPossibleDSLs, useStepsAndViewsContext } from '../api';

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
  const [DSLs, setDSLs] = useState<IDSLProps[]>([]);
  const [settings, setSettings] = useState<ISettings>(currentSettings);
  const [viewData] = useStepsAndViewsContext();

  useEffect(() => {
    const fetchContext = () => {
      fetchPossibleDSLs({ steps: viewData.steps, type: settings.dsl })
        .then((value) => {
          if (value) {
            const dslList: IDSLProps[] = [];

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

    fetchAllDSLs()
      .then((dsls) => {
        setDSLs(dsls);
        fetchContext();
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const onClose = () => {
    handleCloseModal();
  };

  return (
    <div className={'settings-modal'} data-testid={'settings-modal'}>
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
