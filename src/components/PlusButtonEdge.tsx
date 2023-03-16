import { BranchBuilder, MiniCatalog } from '@kaoto/components';
import { useShowBranchTab } from '@kaoto/hooks';
import { StepsService, ValidationService, VisualizationService } from '@kaoto/services';
import { useIntegrationJsonStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps, IVizStepNode } from '@kaoto/types';
import { Popover, Tooltip } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { EdgeText, getBezierPath, Position, useReactFlow } from 'reactflow';
import './CustomEdge.css';

const foreignObjectSize = 40;

export interface IPlusButtonEdge {
  data?: any;
  id: string;
  label?: ReactNode;
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
  label,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: IPlusButtonEdge) => {
  // substring is used to remove the 'e-' from the id (i.e. e-{nodeId}>{nodeId})
  const nodeIds = id.substring(2).split('>');
  const sourceNode: IVizStepNode | undefined = useReactFlow().getNode(nodeIds[0]);
  const targetNode: IVizStepNode | undefined = useReactFlow().getNode(nodeIds[1]);
  const stepsService = new StepsService();
  const showBranchesTab = VisualizationService.showBranchesTab(sourceNode?.data.step);
  const showStepsTab = VisualizationService.showStepsTab(sourceNode?.data);

  const layout = useVisualizationStore((state) => state.layout);
  const views = useIntegrationJsonStore((state) => state.views);
  const { disableBranchesTab, disableBranchesTabMsg } = useShowBranchTab(sourceNode?.data.step, views);

  const [edgePath, edgeCenterX, edgeCenterY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleAddBranch = () => {
    stepsService.addBranch(sourceNode?.data.step, { branchUuid: '', identifier: '', steps: [] });
  };

  const onMiniCatalogClickInsert = (selectedStep: IStepProps) => {
    stepsService.handleInsertStep(targetNode, selectedStep);
  };

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
                disableBranchesTab={disableBranchesTab}
                disableBranchesTabMsg={disableBranchesTabMsg}
                disableStepsTab={!showStepsTab}
                disableStepsTabMsg="You can't add a step between a step and a branch."
                handleSelectStep={onMiniCatalogClickInsert}
                queryParams={{
                  type: ValidationService.insertableStepTypes(
                    sourceNode?.data.step,
                    targetNode?.data.step
                  ),
                }}
                step={sourceNode?.data.step}
              >
                <BranchBuilder handleAddBranch={handleAddBranch} />
              </MiniCatalog>
            }
            enableFlip
            flipBehavior={['top-start', 'left-start']}
            hasAutoWidth
            hideOnOutsideClick
            position="right-start"
          >
            <Tooltip
              content={ValidationService.getPlusButtonTooltipMsg(showBranchesTab, showStepsTab)}
              position={layout === 'LR' ? 'top' : 'right'}
            >
              <button className="plusButton" data-testid={'stepNode__insertStep-btn'}>
                <PlusIcon />
              </button>
            </Tooltip>
          </Popover>
        </span>
      </foreignObject>
      {label && (
        <EdgeText
          x={edgeCenterX + foreignObjectSize / 2}
          y={edgeCenterY + foreignObjectSize / 2}
          label={label}
        />
      )}
    </>
  );
};

export { PlusButtonEdge };
