import './MetadataEditorModal.css';
import { HelperText, HelperTextItem, TextInput } from '@patternfly/react-core';
import '@patternfly/react-styles/css/components/Table/table';
import { Td, TdProps, TreeRowWrapper } from '@patternfly/react-table';
import { FormEvent, useState } from 'react';

type PropertyPlaceholderRowProps = {
  propertyName: string;
  path: string[];
  parentModel: any;
  rowIndex: number;
  level: number;
  posinset: number;
  isObject: boolean;
  onChangeModel: () => void;
};

/**
 * Represents a row in the {@link PropertiesField} table.
 * @param propertyName
 * @param path
 * @param parentModel
 * @param treeRow
 * @param isObject
 * @param onChangeModel
 * @constructor
 */
export function PropertyPlaceholderRow({
  propertyName,
  path,
  parentModel,
  rowIndex,
  level,
  posinset,
  isObject,
  onChangeModel,
}: PropertyPlaceholderRowProps) {
  const [userInputName, setUserInputName] = useState<string>('');
  const [isUserInputNameDuplicate, setUserInputNameDuplicate] = useState<boolean>(false);

  const treeRow: TdProps['treeRow'] = {
    rowIndex,
    onCollapse: () => {},
    props: {
      isRowSelected: true,
      isExpanded: false,
      isHidden: false,
      'aria-level': level,
      'aria-posinset': posinset,
      'aria-setsize': 0,
    },
  };

  function handleUserInputName(name: string, event: FormEvent<HTMLInputElement>) {
    event.stopPropagation();
    setUserInputName(name);
    setUserInputNameDuplicate(!!(name && parentModel[name] != null));
  }

  function commitUserInputName() {
    if (!!userInputName && !isUserInputNameDuplicate) {
      parentModel[userInputName] = isObject ? {} : '';
    }
    onChangeModel();
  }

  return (
    <TreeRowWrapper row={{ props: treeRow!.props }} className="pf-m-selected propertyRow">
      <Td dataLabel="NAME" treeRow={treeRow}>
        <TextInput
          autoFocus={true}
          aria-label={`${propertyName}-${path.join('-')}-placeholder-name`}
          data-testid={`${propertyName}-${path.join('-')}-placeholder-name-input`}
          name={`properties-input-${propertyName}-${path.join('-')}-name`}
          type="text"
          aria-invalid={isUserInputNameDuplicate}
          value={userInputName}
          onKeyDown={(event) => event.stopPropagation()}
          onChange={(value, event) => handleUserInputName(value, event)}
          onBlur={commitUserInputName}
        />
        {isUserInputNameDuplicate && (
          <HelperText>
            <HelperTextItem variant="error">Please specify a unique property name</HelperTextItem>
          </HelperText>
        )}
      </Td>
      <Td dataLabel="VALUE"></Td>
      <Td isActionCell></Td>
    </TreeRowWrapper>
  );
}
