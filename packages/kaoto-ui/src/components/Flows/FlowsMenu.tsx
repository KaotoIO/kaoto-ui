import { useFlowsVisibility } from '../../hooks/flows-visibility.hook';
import { FlowsList } from './FlowsList';
import {
  Badge,
  Icon,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
} from '@patternfly/react-core';
import { Select } from '@patternfly/react-core/next';
import { ListIcon } from '@patternfly/react-icons';
import { FunctionComponent, Ref, useState } from 'react';

export const FlowsMenu: FunctionComponent = () => {
  const visibleFlowsInformation = useFlowsVisibility();
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
            <Icon isInline>
              <ListIcon />
            </Icon>
            <span data-testid="flows-list-route-id" className="pf-u-m-sm-on-lg">
              {visibleFlowsInformation.singleFlowId ?? 'Routes'}
            </span>
            <Badge data-testid="flows-list-route-count" isRead>
              {visibleFlowsInformation.visibleFlowsCount}/{visibleFlowsInformation.totalFlowsCount}
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
      minWidth="400px"
    >
      <FlowsList
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </Select>
  );
};
