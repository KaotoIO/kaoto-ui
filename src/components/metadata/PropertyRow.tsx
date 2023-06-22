import { AddPropertyButtons } from './AddPropertyButtons';
import './MetadataEditorModal.css';
import { Button, HelperText, HelperTextItem, TextInput, Tooltip } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { Td, TdProps, TreeRowWrapper } from '@patternfly/react-table';
import { FormEvent, useState } from 'react';

type PropertyRowProps = {
  propertyName: string;
  nodeName: string;
  nodeValue: any;
  path: string[];
  parentModel: any;
  treeRow: TdProps['treeRow'];
  isObject: boolean;
  onChangeModel: () => void;
  createPlaceholder: (isObject: boolean) => void;
};

/**
 * Represents a row in the {@link PropertiesField} table.
 * @param propertyName
 * @param nodeName
 * @param nodeValue
 * @param path
 * @param parentModel
 * @param treeRow
 * @param isObject
 * @param onChangeModel
 * @constructor
 */
export function PropertyRow({
  propertyName,
  nodeName,
  nodeValue,
  path,
  parentModel,
  treeRow,
  isObject,
  onChangeModel,
  createPlaceholder,
}: PropertyRowProps) {
  function handleTrashClick(parentModel: any, nodeName: string) {
    delete parentModel[nodeName];
    onChangeModel();
  }
  const [userInputValue, setUserInputValue] = useState<string>(nodeValue);
  const [userInputName, setUserInputName] = useState<string>(nodeName);
  const [isUserInputNameDuplicate, setUserInputNameDuplicate] = useState<boolean>(false);

  function handleUserInputName(name: string, event: FormEvent<HTMLInputElement>) {
    event.stopPropagation();
    setUserInputName(name);
    setUserInputNameDuplicate(!!(name && name !== nodeName && parentModel[name] != null));
  }

  function handleUserInputValue(value: string, event: FormEvent<HTMLInputElement>) {
    event.stopPropagation();
    setUserInputValue(value);
  }

  function commitUserInputName() {
    if (userInputName != null && userInputName !== nodeName && !isUserInputNameDuplicate) {
      const value = parentModel[nodeName];
      delete parentModel[nodeName];
      parentModel[userInputName] = value;
      onChangeModel();
    } else {
      setUserInputName(nodeName);
    }
  }

  function commitUserInputValue() {
    if (userInputValue != null && userInputValue !== nodeValue) {
      parentModel[nodeName] = userInputValue;
      onChangeModel();
    }
  }

  return (
    <TreeRowWrapper
      key={`${propertyName}-${path.join('-')}`}
      row={{ props: treeRow!.props }}
    >
      <Td dataLabel="NAME" treeRow={treeRow}>
        <TextInput
          aria-label={`${propertyName}-${path.join('-')}-name`}
          data-testid={`${propertyName}-${path.join('-')}-name-input`}
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
      <Td dataLabel="VALUE">
        {isObject ? (
          <AddPropertyButtons path={path} createPlaceholder={createPlaceholder} />
        ) : (
          <TextInput
            aria-label={`${propertyName}-${path.join('-')}-value`}
            data-testid={`${propertyName}-${path.join('-')}-value-input`}
            name={`properties-input-${propertyName}-${path.join('-')}-value`}
            type="text"
            value={userInputValue}
            onKeyDown={(event) => event.stopPropagation()}
            onChange={(value, event) => handleUserInputValue(value, event)}
            onBlur={commitUserInputValue}
          />
        )}
      </Td>
      <Td isActionCell>
        <Tooltip content="Delete property">
          <Button
            data-testid={'properties-delete-property-' + nodeName + '-btn'}
            icon={<TrashIcon />}
            variant="link"
            onClick={() => handleTrashClick(parentModel, nodeName)}
          ></Button>
        </Tooltip>
      </Td>
    </TreeRowWrapper>
  );
}
