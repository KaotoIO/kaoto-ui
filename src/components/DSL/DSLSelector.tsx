import { useSettingsStore } from '@kaoto/store';
import { IDsl } from '@kaoto/types';
import { MenuToggle, MenuToggleElement } from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import {
  FunctionComponent,
  PropsWithChildren,
  MouseEvent as ReactMouseEvent,
  Ref,
  useCallback,
  useState,
} from 'react';
import { shallow } from 'zustand/shallow';

interface IDSLSelector extends PropsWithChildren {
  isStatic?: boolean;
  selectedDsl?: IDsl;
  onSelect?: (value: IDsl) => void;
}

export const DSLSelector: FunctionComponent<IDSLSelector> = (props) => {
  const capabilities = useSettingsStore((state) => state.settings.capabilities, shallow);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<IDsl | undefined>(
    props.isStatic ? undefined : props.selectedDsl ?? capabilities[0],
  );

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

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

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      data-testid="dsl-select"
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
    >
      {props.children}
    </MenuToggle>
  );

  return (
    <Select
      id="dsl-select"
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
          return (
            <SelectOption
              key={`dsl-${capability.name}`}
              itemId={capability.name}
              description={<span className="pf-u-text-break-word">{capability.description}</span>}
            >
              {capability.name}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};
