import { useSettingsStore } from '@kaoto/store';
import { IDsl } from '@kaoto/types';
import { MenuToggle, MenuToggleAction, MenuToggleElement, Tooltip } from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import {
  FunctionComponent,
  PropsWithChildren,
  MouseEvent as ReactMouseEvent,
  Ref,
  useCallback,
  useState,
} from 'react';
import { useFlowsVisibility } from '../../hooks/flows-visibility.hook';
import { shallow } from 'zustand/shallow';

interface IDSLSelector extends PropsWithChildren {
  isStatic?: boolean;
  selectedDsl?: IDsl;
  onSelect?: (value: IDsl) => void;
}

export const DSLSelector: FunctionComponent<IDSLSelector> = (props) => {
  const { capabilities, currentDsl } = useSettingsStore(
    (state) => ({ capabilities: state.settings.capabilities, currentDsl: state.settings.dsl }),
    shallow,
  );
  const { totalFlowsCount } = useFlowsVisibility();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<IDsl | undefined>(
    props.isStatic ? undefined : props.selectedDsl ?? capabilities[0],
  );

  /** Toggle the DSL dropdown */
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  /** Selecting a DSL checking the the existing flows */
  const onSelect = useCallback(
    (
      _: ReactMouseEvent<Element, MouseEvent> | undefined,
      selectedDslName: string | number | undefined,
    ) => {
      const dsl = capabilities.find((capability) => capability.name === selectedDslName);

      if (!props.isStatic) {
        setSelected(dsl);
      }

      setIsOpen(false);
      if (typeof props.onSelect === 'function' && dsl !== undefined) {
        props.onSelect(dsl);
      }
    },
    [capabilities, props],
  );

  /** Selecting the same DSL directly*/
  const onNewSameTypeRoute = useCallback(() => {
    onSelect(undefined, currentDsl.name);
  }, [currentDsl.name, onSelect]);

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      data-testid="dsl-list-dropdown"
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
      splitButtonOptions={{
        variant: 'action',
        items: [
          <Tooltip
            key="dsl-list-tooltip"
            position="bottom"
            content={
              currentDsl.supportsMultipleFlows ? (
                <p>Add a new {currentDsl.name} route</p>
              ) : (
                <p>The {currentDsl.name} type doesn't support multiple routes</p>
              )
            }
          >
            <MenuToggleAction
              id="dsl-list-btn"
              key="dsl-list-btn"
              data-testid="dsl-list-btn"
              aria-label="DSL list"
              onClick={onNewSameTypeRoute}
              isDisabled={!currentDsl.supportsMultipleFlows && totalFlowsCount > 0}
            >
              {props.children}
            </MenuToggleAction>
          </Tooltip>,
        ],
      }}
    />
  );

  return (
    <Select
      id="dsl-list-select"
      isOpen={isOpen}
      selected={selected?.name}
      onSelect={onSelect}
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
      }}
      toggle={toggle}
      minWidth="300px"
    >
      <SelectList>
        {capabilities.map((capability) => {
          const isOptionDisabled =
            capability.name === currentDsl.name &&
            !capability.supportsMultipleFlows &&
            totalFlowsCount > 0;

          return (
            <SelectOption
              key={`dsl-${capability.name}`}
              data-testid={`dsl-${capability.name}`}
              itemId={capability.name}
              description={<span className="pf-u-text-break-word">{capability.description}</span>}
              isDisabled={isOptionDisabled}
            >
              {capability.name}
              {isOptionDisabled && ' (single route only)'}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};
