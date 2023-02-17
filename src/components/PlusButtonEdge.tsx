import './CustomEdge.css';
import { BranchBuilder, MiniCatalog } from '@kaoto/components';
import { StepsService, ValidationService } from '@kaoto/services';
import { useIntegrationJsonStore, useNestedStepsStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps, IVizStepNode } from '@kaoto/types';
import { Popover } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { getBezierPath, Position, useReactFlow } from 'reactflow';

const foreignObjectSize = 40;
const insertStepInStore = useIntegrationJsonStore.getState().insertStep;
const replaceStep = useIntegrationJsonStore.getState().replaceStep;

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
  // substring is used to remove the 'e-' from the id (i.e. e-{nodeId}>{nodeId})
  const nodeIds = id.substring(2).split('>');
  const sourceNode: IVizStepNode | undefined = useReactFlow().getNode(nodeIds[0]);
  const targetNode: IVizStepNode | undefined = useReactFlow().getNode(nodeIds[1]);
  const integrationJsonStore = useIntegrationJsonStore();
  const nestedStepsStore = useNestedStepsStore();
  const visualizationStore = useVisualizationStore();
  const stepsService = new StepsService(integrationJsonStore, nestedStepsStore, visualizationStore);
  const currentIdx = stepsService.findStepIdxWithUUID(targetNode?.data.step.UUID);

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
    if (targetNode?.data.branchInfo) {
      const rootStepIdx = stepsService.findStepIdxWithUUID(targetNode?.data.branchInfo.parentUuid);
      const currentStepNested = nestedStepsStore.nestedSteps.map(
        (ns) => ns.stepUuid === targetNode?.data.step.UUID
      );

      if (currentStepNested) {
        // 1. make a copy of the steps, get the root step
        const newStep = integrationJsonStore.integrationJson.steps.slice()[rootStepIdx];
        // 2. find the correct branch, insert new step there
        newStep.branches?.forEach((b, bIdx) => {
          b.steps.map((bs, bsIdx) => {
            if (bs.UUID === targetNode?.data.step.UUID) {
              // 3. assign the new steps back to the branch
              newStep.branches![bIdx].steps = StepsService.insertStep(b.steps, bsIdx, selectedStep);
            }
          });
        });

        replaceStep(newStep, rootStepIdx);
      }
    } else {
      insertStepInStore(selectedStep, currentIdx);
    }
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
                children={<BranchBuilder handleAddBranch={handleAddBranch} />}
                handleSelectStep={onMiniCatalogClickInsert}
                queryParams={{
                  type: ValidationService.insertableStepTypes(
                    sourceNode?.data.step,
                    targetNode?.data.step
                  ),
                }}
                step={sourceNode?.data.step}
              />
            }
            enableFlip={true}
            flipBehavior={['top-start', 'left-start']}
            hasAutoWidth
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
