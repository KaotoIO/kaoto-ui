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
  Modal,
  ModalVariant,
  Popover,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { useEffect, useState } from 'react';

export interface IDeploymentsModal {
  // currentDeployments: IDeployments;
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
export const DeploymentsModal = ({
  // currentDeployments,
  handleCloseModal,
  isModalOpen,
}: IDeploymentsModal) => {
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
        <DataList aria-label="Checkbox and action data list example">
          <DataListItem aria-labelledby="check-action-item2">
            <DataListItemRow>
              <DataListCheck aria-labelledby="check-action-item2" name="check-action-check2" />
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <span id="check-action-item2">Example deployment</span> dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod.
                  </DataListCell>,
                  <DataListCell key="secondary content">
                    Secondary content. Dolor sit amet, consectetur adipisicing elit, sed do eiusmod.
                  </DataListCell>,
                ]}
              />
              <DataListAction
                visibility={{ default: 'hidden', lg: 'visible' }}
                aria-labelledby="check-action-item2 check-action-action2"
                id="check-action-action2"
                aria-label="Actions"
              >
                <Button variant="primary">Details</Button>
                <Button variant="secondary">Delete</Button>
              </DataListAction>
            </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="check-action-item3">
            <DataListItemRow>
              <DataListCheck aria-labelledby="check-action-item3" name="check-action-check3" />
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <span id="check-action-item3">Example deployment</span> dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod.
                  </DataListCell>,
                  <DataListCell key="secondary content">
                    Secondary content. Dolor sit amet, consectetur adipisicing elit, sed do eiusmod.
                  </DataListCell>,
                ]}
              />
              <DataListAction
                visibility={{ default: 'hidden', lg: 'visible' }}
                aria-labelledby="check-action-item3 check-action-action3"
                id="check-action-action3"
                aria-label="Actions"
              >
                <Button variant="primary">Details</Button>
                <Button variant="secondary">Delete</Button>
              </DataListAction>
            </DataListItemRow>
          </DataListItem>
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
        </DataList>
      </Modal>
    </div>
  );
};
