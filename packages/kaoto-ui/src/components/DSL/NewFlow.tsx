import { ConfirmationModal } from '../ConfirmationModal';
import { DSLSelector } from './DSLSelector';
import { FlowsStoreFacade, useFlowsStore, useSettingsStore } from '@kaoto/store';
import { IDsl } from '@kaoto/types';
import { PlusIcon } from '@patternfly/react-icons';
import { FunctionComponent, PropsWithChildren, useCallback, useState } from 'react';
import { shallow } from 'zustand/shallow';

export const NewFlow: FunctionComponent<PropsWithChildren> = () => {
  const { namespace, setSettings } = useSettingsStore(
    ({ settings, setSettings }) => ({
      namespace: settings.namespace,
      setSettings,
    }),
    shallow,
  );
  const { addNewFlow, deleteAllFlows } = useFlowsStore(
    ({ addNewFlow, deleteAllFlows }) => ({ addNewFlow, deleteAllFlows }),
    shallow,
  );

  const [proposedDsl, setProposedNewDsl] = useState<IDsl>();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const checkBeforeAddNewFlow = useCallback(
    (dsl: IDsl) => {
      const isSameDsl = FlowsStoreFacade.isSameDsl(dsl.name);

      if (isSameDsl) {
        /**
         * If it's the same DSL as we have in the existing Flows list,
         * we don't need to do anything special, just add a new flow if
         * supported
         */
        setSettings({ dsl, namespace });
        addNewFlow(dsl.name);
      } else {
        /**
         * If it is not the same DSL, this operation might result in
         * removing the existing flows, so then we warn the user first
         */
        setProposedNewDsl(dsl);
        setIsConfirmationModalOpen(true);
      }
    },
    [addNewFlow, namespace, setSettings],
  );

  return (
    <>
      <DSLSelector isStatic onSelect={checkBeforeAddNewFlow}>
        <PlusIcon />
        <span className="pf-u-m-sm-on-lg">New route</span>
      </DSLSelector>

      <ConfirmationModal
        handleCancel={() => {
          setIsConfirmationModalOpen(false);
        }}
        handleConfirm={() => {
          deleteAllFlows();

          setSettings({ dsl: proposedDsl, namespace });

          addNewFlow(proposedDsl!.name);
          setIsConfirmationModalOpen(false);
        }}
        isModalOpen={isConfirmationModalOpen}
      >
        <p>
          This will remove the existing routes and you will lose your current work. Are you sure you
          would like to proceed?
        </p>
      </ConfirmationModal>
    </>
  );
};
