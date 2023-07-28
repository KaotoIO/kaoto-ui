import { AddPropertyButtons } from './AddPropertyButtons';
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
import { ReactNode, useState } from 'react';
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
  const [placeholderState, setPlaceholderState] = useState<PlaceholderState | null>(null);
  const propertiesModel = props.value ? { ...props.value } : {};

  type PlaceholderState = {
    isObject: boolean;
    parentNodeId: string;
  };

  function handleModelChange() {
    setPlaceholderState(null);
    props.onChange(propertiesModel, props.name);
  }

  function getNodeId(path: string[]) {
    return path.join('-');
  }

  function handleCreatePlaceHolder(state: PlaceholderState) {
    setPlaceholderState({ ...state });
    if (state.parentNodeId && state.parentNodeId.length > 0) {
      expandedNodes.includes(state.parentNodeId) ||
        setExpandedNodes([...expandedNodes, state.parentNodeId]);
    }
  }

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
      // placeholder is rendered as a last sibling
      const placeholderTreeRow: TdProps['treeRow'] = {
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

      return placeholderState && placeholderState.parentNodeId === getNodeId(parentPath)
        ? [
            <PropertyRow
              isPlaceholder={true}
              key="placeholder"
              propertyName={props.name}
              nodeName=""
              nodeValue={placeholderState.isObject ? {} : ''}
              path={parentPath}
              parentModel={parentModel}
              treeRow={placeholderTreeRow}
              isObject={placeholderState.isObject}
              onChangeModel={handleModelChange}
              createPlaceholder={() => {}}
            />,
          ]
        : [];
    }

    const nodeName = node[0];
    const nodeValue = node[1];
    const path = parentPath.slice();
    path.push(nodeName);
    const nodeId = getNodeId(path);
    const isExpanded = expandedNodes.includes(nodeId);

    const childRows =
      typeof nodeValue === 'object'
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

    const siblingRows = renderRows(
      remainingNodes,
      parentModel,
      parentPath,
      level,
      posinset + 1,
      rowIndex + 1 + childRows.length,
      isHidden,
    );

    const treeRow: TdProps['treeRow'] = {
      onCollapse: () =>
        setExpandedNodes((prevExpanded) => {
          const otherExpandedNodeIds = prevExpanded.filter((id) => id !== nodeId);
          return isExpanded ? otherExpandedNodeIds : [...otherExpandedNodeIds, nodeId];
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

    return [
      <PropertyRow
        key={`${props.name}-${getNodeId(path)}`}
        propertyName={props.name}
        nodeName={nodeName}
        nodeValue={nodeValue}
        path={path}
        parentModel={parentModel}
        treeRow={treeRow}
        isObject={typeof nodeValue === 'object'}
        onChangeModel={handleModelChange}
        createPlaceholder={(isObject) => {
          handleCreatePlaceHolder({
            isObject: isObject,
            parentNodeId: getNodeId(path),
          });
        }}
      />,
      ...childRows,
      ...siblingRows,
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
                  <Td modifier="nowrap" isActionCell>
                    <AddPropertyButtons
                      path={[]}
                      disabled={props.disabled}
                      createPlaceholder={(isObject) =>
                        handleCreatePlaceHolder({
                          isObject: isObject,
                          parentNodeId: '',
                        })
                      }
                    />
                  </Td>
                </Tr>
              </Thead>
              <Tbody>
                {Object.keys(propertiesModel).length > 0 || placeholderState
                  ? renderRows(Object.entries(propertiesModel), propertiesModel)
                  : !props.disabled && (
                      <Tr key={`${props.name}-empty`}>
                        <Td colSpan={3}>
                          <EmptyState>
                            <EmptyStateBody>No {props.name}</EmptyStateBody>
                            <AddPropertyButtons
                              showLabel={true}
                              path={[]}
                              disabled={props.disabled}
                              createPlaceholder={(isObject) =>
                                handleCreatePlaceHolder({
                                  isObject: isObject,
                                  parentNodeId: '',
                                })
                              }
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
