import './DeploymentsModal.css';
import { fetchDeployments, stopDeployment } from '../api';
import { CustomExclamationTriangleIcon } from './Icons';
import { useDeploymentStore, useSettingsStore } from '@kaoto/store';
import { IDeployment } from '@kaoto/types';
import { formatDateTime } from '@kaoto/utils';
import {
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  Modal,
  ModalVariant,
  Popover,
  Title,
  AlertVariant,
  Badge,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  InputGroup,
  SearchInput,
} from '@patternfly/react-core';
import { CubesIcon, HelpIcon } from '@patternfly/react-icons';
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ThProps,
  IAction,
  ActionsColumn,
} from '@patternfly/react-table';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useRef, useState } from 'react';

export interface IDeploymentsModal {
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

/**
 * Contains the contents for the Deployments modal.
 * @param currentDeployment
 * @param handleCloseModal
 * @param isModalOpen
 * @constructor
 */
export const DeploymentsModal = ({ handleCloseModal, isModalOpen }: IDeploymentsModal) => {
  const [deployments, setDeployments] = useState<IDeployment[]>([]);
  const [query, setQuery] = useState(``);
  const { settings } = useSettingsStore();
  const [activeSortIndex, setActiveSortIndex] = useState<number | undefined>(2);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc' | undefined>(
    'desc'
  );
  const { deployment } = useDeploymentStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { addAlert } = useAlert() || {};

  useEffect(() => {
    // fetch deployments and on changes to deployment, re-fetch list of deployments
    if (settings.namespace !== '') {
      fetchDeployments('no-cache', settings.namespace)
          .then((output) => {
            setDeployments(output);
          })
          .catch((e) => {
            throw Error(e);
          });
    }
    searchInputRef.current?.focus();
  }, [deployment, settings.namespace]);

  const columnNames = {
    name: 'Name',
    namespace: 'Namespace',
    date: 'Date',
    errors: 'Errors',
    status: 'Status',
    type: 'Type',
  };

  const defaultActions = (deployment: IDeployment): IAction[] => [
    {
      title: 'Delete',
      onClick: () => {
        handleDeleteDeployment(deployment);
      },
    },
  ];

  const getSortableRowValues = (deployment: IDeployment) => {
    const { name, namespace, date, errors, status, type } = deployment;
    return [name, namespace, date, errors, status, type];
  };

  let sortedDeployments = deployments;

  if (typeof activeSortIndex !== 'undefined') {
    sortedDeployments = deployments.sort((a, b) => {
      const aValue = getSortableRowValues(a)[activeSortIndex];
      const bValue = getSortableRowValues(b)[activeSortIndex];
      if (activeSortDirection === 'asc') {
        return (aValue as string).localeCompare(bValue as string);
      }
      return (bValue as string).localeCompare(aValue as string);
    });
  }

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'desc',
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  function search(items: IDeployment[]) {
    return items.filter((item) => {
      return item.name.toLowerCase().indexOf(query.trim().toLowerCase()) > -1;
    });
  }

  const changeSearch = (e: any) => {
    setQuery(e);
  };

  const handleDeleteDeployment = (deployment: IDeployment) => {
    stopDeployment(deployment.name, settings.namespace)
      .then(() => {
        // fetch deployments
        fetchDeployments('no-cache', settings.namespace)
          .then((output) => {
            setDeployments(output);
          })
          .catch((e) => {
            throw Error(e);
          });

        addAlert &&
          addAlert({
            title: 'Delete Resource',
            variant: AlertVariant.success,
            description: 'Deleting the resource..',
          });
      })
      .catch((e) => {
        console.error(e);
        addAlert &&
          addAlert({
            title: 'Something went wrong',
            variant: AlertVariant.danger,
            description: 'There was a problem deleting the resource. Please try again later.',
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
        {deployments.length > 0 ? (
          <>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem style={{ padding: '0', marginRight: '0' }}>
                  <InputGroup>
                    <SearchInput
                      name={'deploymentSearch'}
                      id={'deploymentSearch'}
                      type={'search'}
                      placeholder={'search for deployment...'}
                      aria-label={'search for deployment'}
                      value={query}
                      onChange={changeSearch}
                      onClear={() => setQuery('')}
                      ref={searchInputRef}
                    />
                  </InputGroup>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <TableComposable aria-label="List of deployments"
            >
              <Thead>
                <Tr>
                  <Th sort={getSortParams(0)}>{columnNames.name}</Th>
                  <Th modifier="wrap" info={{ tooltip: 'Cluster namespace' }}>
                    {columnNames.namespace}
                  </Th>
                  <Th modifier="wrap" sort={getSortParams(2)}>
                    {columnNames.date}
                  </Th>
                  <Th modifier="wrap">{columnNames.errors}</Th>
                  <Th modifier="wrap" sort={getSortParams(4)}>{columnNames.status}</Th>
                  <Th modifier="wrap" sort={getSortParams(5)}>{columnNames.type}</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedDeployments && search(sortedDeployments).map((dep, rowIndex) => (
                  <Tr key={rowIndex}>
                    <Td dataLabel={columnNames.name}>
                      <b>{dep.name}</b>
                    </Td>
                    <Td dataLabel={columnNames.namespace}>{dep.namespace}</Td>
                    <Td dataLabel={columnNames.date}>{formatDateTime(dep.date)}</Td>
                    <Td dataLabel={columnNames.errors}>
                      {dep.errors.length > 0 && (
                        <span>
                          <CustomExclamationTriangleIcon color="red" />
                          &nbsp;&nbsp;
                        </span>
                      )}
                      {dep.errors.length}
                    </Td>
                    <Td dataLabel={columnNames.status}>{dep.status}</Td>
                    <Td dataLabel={columnNames.type}>
                      <Badge key={rowIndex} isRead>
                        {dep.type}
                      </Badge>
                    </Td>
                    <Td isActionCell>
                      <ActionsColumn items={defaultActions(dep)} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </TableComposable>
          </>
        ) : (
          <EmptyState isFullHeight={true} variant={EmptyStateVariant.small}>
            <EmptyStateIcon icon={CubesIcon} />
            <Title headingLevel="h4" size="lg">
              No deployments
            </Title>
            <EmptyStateBody>Your resources and deployments will appear here.</EmptyStateBody>
          </EmptyState>
        )}
      </Modal>
    </div>
  );
};
