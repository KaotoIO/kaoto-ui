import { fetchDeployments } from '../api';
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
} from '@patternfly/react-core';
import { CubesIcon, HelpIcon } from '@patternfly/react-icons';
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
                        <Button variant="primary">Details</Button>
                        <Button variant="secondary">Delete</Button>
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
