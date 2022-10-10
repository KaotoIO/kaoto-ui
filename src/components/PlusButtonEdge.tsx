import './PlusButtonEdge.css';
import { MiniCatalog } from '@kaoto/components';
import { findStepIdxWithUUID, insertableStepTypes } from '@kaoto/services';
import { useIntegrationJsonStore } from '@kaoto/store';
import { IStepProps } from '@kaoto/types';
import { Popover } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { getBezierPath, Node, Position, useNodes, useReactFlow } from 'reactflow';

const foreignObjectSize = 40;
const insertStep = useIntegrationJsonStore.getState().insertStep;

export interface IPlusButtonEdge {
  data?: any;
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position | undefined;
  targetPosition: Position | undefined;
  style?: any;
  markerEnd?: string;
}

/* PLUS BUTTON TO INSERT STEP */
const PlusButtonEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: IPlusButtonEdge) => {
  const nodes: Node[] = useNodes();
  // substring is used to remove the 'e-' from the id (i.e. e-{nodeId}>{nodeId})
  const nodeIds = id.substring(2).split('>');
  const targetNode = useReactFlow().getNode(nodeIds[1]);
  const currentIdx = findStepIdxWithUUID(targetNode?.data.UUID!);

  const [edgePath, edgeCenterX, edgeCenterY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onMiniCatalogClickInsert = (selectedStep: IStepProps) =>
    insertStep(selectedStep, currentIdx);

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 2}
        className="plusButton-foreignObject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <span>
          <Popover
            appendTo={() => document.body}
            aria-label="Search for a step"
            bodyContent={
              <MiniCatalog
                handleSelectStep={onMiniCatalogClickInsert}
                queryParams={{
                  type: insertableStepTypes(nodes[currentIdx - 1]?.data, nodes[currentIdx]?.data),
                }}
              />
            }
            enableFlip={true}
            flipBehavior={['top-start', 'left-start']}
            hideOnOutsideClick={true}
            position={'right-start'}
          >
            <button className="plusButton" data-testid={'stepNode__insertStep-btn'}>
              <PlusIcon />
            </button>
          </Popover>
        </span>
      </foreignObject>
    </>
  );
};

export { PlusButtonEdge };
