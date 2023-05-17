import './CustomEdge.css';
import { BranchBuilder, MiniCatalog } from '@kaoto/components';
import { usePosition, useShowBranchTab } from '@kaoto/hooks';
import { StepsService, ValidationService } from '@kaoto/services';
import { useIntegrationJsonStore } from '@kaoto/store';
import { IStepProps, IVizStepNode } from '@kaoto/types';
import { Popover, Tooltip } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { EdgeText, getBezierPath, Position } from 'reactflow';

const foreignObjectSize = 40;

export interface IPlusButtonEdge {
  data?: {
    showBranchesTab: boolean;
    showStepsTab: boolean;
    sourceStepNode: IVizStepNode;
    targetStepNode: IVizStepNode;
  };
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
  data,
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
  const stepsService = new StepsService();
  const showBranchesTab = data?.showBranchesTab;
  const showStepsTab = data?.showStepsTab;
  const sourceNode = data?.sourceStepNode;
  const targetNode = data?.targetStepNode;

  const { tooltipPosition } = usePosition();
  const views = useIntegrationJsonStore((state) => state.views);
  const { disableBranchesTab, disableBranchesTabMsg } = useShowBranchTab(
    sourceNode?.data.step,
    views
  );

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
                  previousStep: sourceNode?.data.step.id,
                  followingStep: targetNode?.data.step.id,
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
              position={tooltipPosition}
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
