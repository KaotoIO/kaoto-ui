import { AddPropertyButton } from './AddPropertyButton';
import { Button, TextInput, Tooltip, Truncate } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { Td, TdProps, TreeRowWrapper } from '@patternfly/react-table';
import { useState } from 'react';

type PropertyRowProps = {
  propertyName: string;
  nodeName: string;
  nodeValue: any;
  path: string[];
  parentModel: any;
  treeRow: TdProps['treeRow'];
  isObject: boolean;
  onChangeModel: () => void;
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
}: PropertyRowProps) {
  function handleTrashClick(parentModel: any, nodeName: string) {
    delete parentModel[nodeName];
    onChangeModel();
  }
  const [rowValue, setRowValue] = useState<string>(nodeValue);

  function handleChangeModel() {
    parentModel[nodeName] = rowValue;
    onChangeModel();
  }

  return (
    <TreeRowWrapper key={`${propertyName}-${path.join('-')}`} row={{ props: treeRow!.props }}>
      <Td dataLabel="NAME" treeRow={treeRow}>
        <Truncate content={nodeName} />
      </Td>
      <Td dataLabel="VALUE">
        {isObject ? (
          <AddPropertyButton model={nodeValue} path={path} onChangeModel={onChangeModel} />
        ) : (
          <TextInput
            aria-label={`${propertyName}-${path.join('-')}-value`}
            data-testid={`${propertyName}-${path.join('-')}-value-input`}
            name={`properties-input-${propertyName}-${path.join('-')}-value`}
            type="text"
            value={rowValue}
            onChange={(value) => setRowValue(value)}
            onBlur={handleChangeModel}
          />
        )}
      </Td>
      <Td>
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
