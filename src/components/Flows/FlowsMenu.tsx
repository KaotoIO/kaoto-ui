import { FlowsList } from './FlowsList';
import { VisualizationService } from '@kaoto/services';
import { useVisualizationStore } from '@kaoto/store';
import { Badge, MenuToggle, MenuToggleAction, MenuToggleElement } from '@patternfly/react-core';
import { Select } from '@patternfly/react-core/next';
import { ListIcon } from '@patternfly/react-icons';
import { FunctionComponent, Ref, useState } from 'react';
import { shallow } from 'zustand/shallow';

export const FlowsMenu: FunctionComponent = () => {
  const visibleFlowsInformation = useVisualizationStore(
    ({ visibleFlows }) => VisualizationService.getVisibleFlowsInformation(visibleFlows),
    shallow,
  );

  const [isOpen, setIsOpen] = useState(false);

  /** Toggle the DSL dropdown */
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      data-testid="flows-list-dropdown"
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
      splitButtonOptions={{
        variant: 'action',
        items: [
          <MenuToggleAction
            id="flows-list-btn"
            key="flows-list-btn"
            data-testid="flows-list-btn"
            aria-label="flows list"
            onClick={onToggleClick}
          >
            <ListIcon />
            <span data-testid="flows-list-route-id" className="pf-u-m-sm-on-lg">
              {visibleFlowsInformation.singleFlowId ?? 'Routes'}
            </span>
            <Badge data-testid="flows-list-route-count" isRead>
              {visibleFlowsInformation.currentVisible}/{visibleFlowsInformation.flowsCount}
            </Badge>
          </MenuToggleAction>,
        ],
      }}
    />
  );

  return (
    <Select
      id="flows-list-select"
      isOpen={isOpen}
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
      }}
      toggle={toggle}
      minWidth="300px"
    >
      <FlowsList
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </Select>
  );
};
