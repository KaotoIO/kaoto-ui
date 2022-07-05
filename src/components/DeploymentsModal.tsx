import { fetchDeployments, stopDeployment, useSettingsContext } from '../api';
import { IDeployment } from '../types';
import {
  Button,
  DataList,
  DataListAction,
  DataListCell,
  DataListCheck,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  Modal,
  ModalVariant,
  Popover,
  Title,
  AlertVariant,
} from '@patternfly/react-core';
import { CubesIcon, HelpIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useState } from 'react';

export interface IDeploymentsModal {
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

/**
 * Contains the contents for the Deployments modal.
 * @param currentDeployments
 * @param handleCloseModal
 * @param isModalOpen
 * @constructor
 */
export const DeploymentsModal = ({ handleCloseModal, isModalOpen }: IDeploymentsModal) => {
  const [deployments, setDeployments] = useState<IDeployment[]>([]);
  const [settings] = useSettingsContext();

  const { addAlert } = useAlert() || {};

  useEffect(() => {
    // fetch deployments
    fetchDeployments()
      .then((output) => {
        setDeployments(output);
      })
      .catch((e) => {
        throw Error(e);
      });
  }, []);

  const handleDeleteDeployment = (deployment: any) => {
    console.log('deployment: ', deployment);
    stopDeployment(deployment.name, settings.namespace)
      .then(() => {
        addAlert &&
          addAlert({
            title: 'Deleted Deployment',
            variant: AlertVariant.success,
            description: 'Successfully deleted the deployment.',
          });
      })
      .catch((e) => {
        console.error(e);
        addAlert &&
          addAlert({
            title: 'Something went wrong',
            variant: AlertVariant.danger,
            description: 'There was a problem updating the integration. Please try again later.',
          });
      });
  };

  return (
    <div className={'deployments-modal'} data-testid={'deployments-modal'}>
      <Modal
        help={
          <Popover
            headerContent={<div>What is a deployment?</div>}
            bodyContent={
              <div>
                In the context of software, a <b>deployment</b> encompasses all the processes
                involved in getting new software or hardware up and running properly in its
                environment.
              </div>
            }
          >
            <Button variant="plain" aria-label="Help">
              <HelpIcon />
            </Button>
          </Popover>
        }
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Deployments"
        variant={ModalVariant.large}
      >
        <DataList aria-label="List of deployments">
          {deployments.length > 0 ? (
            <>
              {deployments?.map((d, idx) => {
                return (
                  <DataListItem aria-labelledby={`deployment-item-${idx}`} key={idx}>
                    <DataListItemRow>
                      <DataListCheck
                        aria-labelledby={`deployment-item-${idx}`}
                        name={`deployment-check-${idx}`}
                      />
                      <DataListItemCells
                        dataListCells={[
                          <DataListCell key="primary content">{d.name}</DataListCell>,
                          <DataListCell key="secondary content">{d.description}</DataListCell>,
                        ]}
                      />
                      <DataListAction
                        visibility={{ default: 'hidden', lg: 'visible' }}
                        aria-labelledby={`deployment-item-${idx} deployment-check-${idx}`}
                        id={`deployment-action-${idx}`}
                        aria-label="Actions"
                      >
                        {/*<Button variant="primary">Details</Button>*/}
                        <Button variant="secondary" onClick={handleDeleteDeployment}>
                          Delete
                        </Button>
                      </DataListAction>
                    </DataListItemRow>
                  </DataListItem>
                );
              })}
            </>
          ) : (
            <EmptyState variant={EmptyStateVariant.small}>
              <EmptyStateIcon icon={CubesIcon} />
              <Title headingLevel="h4" size="lg">
                No deployments
              </Title>
              <EmptyStateBody>Your deployments will appear here.</EmptyStateBody>
            </EmptyState>
          )}
        </DataList>
      </Modal>
    </div>
  );
};
