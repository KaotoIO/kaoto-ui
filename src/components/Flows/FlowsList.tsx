import { ValidationService } from '../../services';
import { InlineEdit } from '../InlineEdit/InlineEdit';
import './FlowsList.css';
import { FlowsListEmptyState } from './FlowsListEmptyState';
import { useFlowsStore, useVisualizationStore } from '@kaoto/store';
import { Button, Icon } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon, TrashIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { FunctionComponent, useCallback, useRef } from 'react';
import { shallow } from 'zustand/shallow';

interface IFlowsList {
  onClose?: () => void;
}

export const FlowsList: FunctionComponent<IFlowsList> = (props) => {
  const { isListEmpty, flows, setFlowName, deleteFlow } = useFlowsStore(
    (state) => ({
      isListEmpty: state.flows.length === 0,
      flows: state.flows,
      setFlowName: state.setFlowName,
      deleteFlow: state.deleteFlow,
    }),
    shallow,
  );

  const { visibleFlows, toggleFlowVisible, hideAllFlows } = useVisualizationStore(
    ({ visibleFlows, toggleFlowVisible, hideAllFlows }) => ({
      visibleFlows,
      toggleFlowVisible,
      hideAllFlows,
    }),
    shallow,
  );

  const columnNames = useRef({
    id: 'Route Id',
    isVisible: 'Visibility',
    delete: 'Delete',
  });

  const onSelectFlow = useCallback(
    (flowId: string): void => {
      hideAllFlows();
      toggleFlowVisible(flowId);
      props.onClose?.();
    },
    [hideAllFlows, props, toggleFlowVisible],
  );

  return isListEmpty ? (
    <FlowsListEmptyState data-testid="flows-list-empty-state" />
  ) : (
    <TableComposable className="FlowsListTable" variant="compact" data-testid="flows-list-table">
      <Thead>
        <Tr>
          <Th>{columnNames.current.id}</Th>
          <Th>{columnNames.current.isVisible}</Th>
          <Th>{columnNames.current.delete}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {flows.map((flow) => (
          <Tr key={flow.id} data-testid={`flows-list-row-${flow.id}`} isHoverable>
            <Td dataLabel={columnNames.current.id}>
              <InlineEdit
                data-testid={`goto-btn-${flow.metadata.name}`}
                value={flow.metadata.name}
                validator={ValidationService.validateUniqueName}
                onClick={() => {
                  onSelectFlow(flow.id);
                }}
                onChange={(name) => {
                  setFlowName(flow.id, name);
                }}
              />
              <p>{flow.description}</p>
            </Td>

            <Td dataLabel={columnNames.current.isVisible}>
              <Button
                data-testid={`toggle-btn-${flow.id}`}
                icon={
                  visibleFlows[flow.id] ? (
                    <Icon isInline>
                      <EyeIcon data-testid={`toggle-btn-${flow.id}-visible`} />
                    </Icon>
                  ) : (
                    <Icon isInline>
                      <EyeSlashIcon data-testid={`toggle-btn-${flow.id}-hidden`} />
                    </Icon>
                  )
                }
                variant="plain"
                onClick={(event) => {
                  toggleFlowVisible(flow.id);
                  /** Required to avoid closing the Dropdown after clicking in the icon */
                  event.stopPropagation();
                }}
              />
            </Td>

            <Td dataLabel={columnNames.current.delete}>
              <Button
                data-testid={`delete-btn-${flow.id}`}
                icon={<TrashIcon />}
                variant="plain"
                onClick={(event) => {
                  deleteFlow(flow.id);
                  /** Required to avoid closing the Dropdown after clicking in the icon */
                  event.stopPropagation();
                }}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};
