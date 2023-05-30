import { AddPropertyButton } from './AddPropertyButton';
import { PropertyRow } from './PropertyRow';
import wrapField from '@kie-tools/uniforms-patternfly/dist/cjs/wrapField';
import { EmptyState, EmptyStateBody, Stack, StackItem } from '@patternfly/react-core';
import {
  InnerScrollContainer,
  OuterScrollContainer,
  TableComposable,
  TableVariant,
  Tbody,
  Td,
  TdProps,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { ReactNode, useCallback, useState } from 'react';
import { HTMLFieldProps, connectField } from 'uniforms';

export type PropertiesFieldProps = HTMLFieldProps<any, HTMLDivElement>;

/**
 * The uniforms custom field for editing generic properties where it has type "object" in the schema,
 * but it doesn't have "properties" declared.
 * @param props
 * @constructor
 */
function Properties(props: PropertiesFieldProps) {
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  const handleModelChange = useCallback(() => {
    props.onChange(props.value ? props.value : {}, props.name);
  }, [props.onChange, props.value, props.name]);

  function renderRows(
    [node, ...remainingNodes]: [string, any][],
    parentModel: any,
    parentPath: string[] = [],
    level = 1,
    posinset = 1,
    rowIndex = 0,
    isHidden = false,
  ): ReactNode[] {
    if (!node) {
      return [];
    }
    const nodeName = node[0];
    const nodeValue = node[1];
    const isExpanded = expandedNodes.includes(nodeName);
    const path = parentPath.slice();
    path.push(nodeName);

    const treeRow: TdProps['treeRow'] = {
      onCollapse: () =>
        setExpandedNodes((prevExpanded) => {
          const otherExpandedNodeNames = prevExpanded.filter((name) => name !== nodeName);
          return isExpanded ? otherExpandedNodeNames : [...otherExpandedNodeNames, nodeName];
        }),
      rowIndex,
      props: {
        isExpanded,
        isHidden,
        'aria-level': level,
        'aria-posinset': posinset,
        'aria-setsize': typeof nodeValue === 'object' ? Object.keys(nodeValue).length : 0,
      },
    };

    const childRows =
      typeof nodeValue === 'object' && Object.keys(nodeValue).length
        ? renderRows(
            Object.entries(nodeValue),
            nodeValue,
            path,
            level + 1,
            1,
            rowIndex + 1,
            !isExpanded || isHidden,
          )
        : [];

    return [
      <PropertyRow
        key={`${props.name}-${path.join('-')}`}
        propertyName={props.name}
        nodeName={nodeName}
        nodeValue={nodeValue}
        path={path}
        parentModel={parentModel}
        treeRow={treeRow}
        isObject={typeof nodeValue === 'object'}
        onChangeModel={handleModelChange}
      />,
      ...childRows,
      ...renderRows(
        remainingNodes,
        parentModel,
        parentPath,
        level,
        posinset + 1,
        rowIndex + 1 + childRows.length,
        isHidden,
      ),
    ];
  }

  return wrapField(
    props,
    <Stack hasGutter>
      <StackItem isFilled>
        <OuterScrollContainer>
          <InnerScrollContainer>
            <TableComposable
              isTreeTable={true}
              aria-label={props.name}
              variant={TableVariant.compact}
              borders={true}
              isStickyHeader
            >
              <Thead>
                <Tr key={`${props.name}-header`}>
                  <Th modifier="nowrap">NAME</Th>
                  <Th modifier="nowrap">VALUE</Th>
                  <Th modifier="nowrap">
                    <AddPropertyButton
                      model={props.value}
                      path={[]}
                      disabled={props.disabled}
                      onChangeModel={handleModelChange}
                    />
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {props.value && Object.keys(props.value).length > 0
                  ? renderRows(Object.entries(props.value), props.value)
                  : !props.disabled && (
                      <Tr key={`${props.name}-empty`}>
                        <Td colSpan={3}>
                          <EmptyState>
                            <EmptyStateBody>No {props.name}</EmptyStateBody>
                            <AddPropertyButton
                              textLabel="Add property"
                              model={props.value}
                              path={[]}
                              disabled={props.disabled}
                              onChangeModel={handleModelChange}
                            />
                          </EmptyState>
                        </Td>
                      </Tr>
                    )}
              </Tbody>
            </TableComposable>
          </InnerScrollContainer>
        </OuterScrollContainer>
      </StackItem>
    </Stack>,
  );
}

export default connectField<PropertiesFieldProps>(Properties);
