import './Visualization.css';
import { MiniCatalog } from '@kaoto/components';
import {
  appendableStepTypes,
  canStepBeReplaced,
  findStepIdxWithUUID,
  isEipStep,
  isEndStep,
  isLastNode,
  isStartStep,
} from '@kaoto/services';
import { useIntegrationJsonStore, useSettingsStore } from '@kaoto/store';
import { IStepProps, IVizStepNodeData } from '@kaoto/types';
import { AlertVariant, Popover } from '@patternfly/react-core';
import { CubesIcon, PlusIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { Handle, Node, NodeProps, Position, useNodes } from 'reactflow';

const currentDSL = useSettingsStore.getState().settings.dsl;
const appendStep = useIntegrationJsonStore.getState().appendStep;
const replaceStep = useIntegrationJsonStore.getState().replaceStep;

// Custom Node type and component for React Flow
const VisualizationStep = ({ data }: NodeProps<IVizStepNodeData>) => {
  const nodes: Node[] = useNodes();
  // this step will always have a UUID
  const lastNode = isLastNode(nodes, data.UUID!);
  const eipStep = isEipStep(data.step!);
  const startStep = isStartStep(data.step!);
  const endStep = isEndStep(data.step!);
  const currentIdx = findStepIdxWithUUID(data.UUID!);
  const steps = useIntegrationJsonStore((state) => state.integrationJson.steps);

  const { addAlert } = useAlert() || {};

  const onMiniCatalogClickAdd = (selectedStep: IStepProps) => appendStep(selectedStep);

  const showLeftHandle = !startStep || eipStep;
  const showInsertPlusButton = !endStep && lastNode;

  /**
   * Handles dropping a step onto an existing step (i.e. step replacement)
   */
  const onDropReplace = (event: any) => {
    event.preventDefault();

    const dataJSON = event.dataTransfer.getData('text');
    const step: IStepProps = JSON.parse(dataJSON);
    const validation = canStepBeReplaced(data, step, steps);

    // Replace step
    if (validation.isValid) {
      replaceStep(step, currentIdx);
    } else {
      addAlert &&
        addAlert({
          title: 'Replace Step Unsuccessful',
          variant: AlertVariant.danger,
          description: validation.message ?? 'Something went wrong, please try again later.',
        });
    }
  };

  /**
   * Handles dropping a step onto a slot
   * @param e
   */
  const onDropNew = (e: { dataTransfer: { getData: (arg0: string) => any } }) => {
    const dataJSON = e.dataTransfer.getData('text');
    const step: IStepProps = JSON.parse(dataJSON);
    const validation = canStepBeReplaced(data, step, steps);

    if (validation.isValid) {
      // update the steps, the new node will be created automatically
      replaceStep(step);
    } else {
      addAlert &&
        addAlert({
          title: 'Add Step Unsuccessful',
          variant: AlertVariant.danger,
          description: validation.message ?? 'Something went wrong, please try again later.',
        });
    }
  };

  return (
    <>
      {data.step?.UUID ? (
        <div
          className={`stepNode`}
          onDrop={onDropReplace}
          data-testid={`viz-step-${data.step.name}`}
        >
          {/* LEFT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
          {showLeftHandle && (
            <Handle
              isConnectable={false}
              type="target"
              position={Position.Left}
              id="a"
              style={{ borderRadius: 0 }}
            />
          )}
          {/* PLUS BUTTON TO ADD STEP */}
          {showInsertPlusButton && (
            <Popover
              appendTo={() => document.body}
              aria-label="Search for a step"
              bodyContent={
                <MiniCatalog
                  handleSelectStep={onMiniCatalogClickAdd}
                  queryParams={{
                    dsl: currentDSL,
                    type: appendableStepTypes(data.step.type),
                  }}
                />
              }
              className={'miniCatalog__popover'}
              data-testid={'miniCatalog__popover'}
              enableFlip={true}
              flipBehavior={['top-start', 'left-start']}
              hideOnOutsideClick={true}
              position={'right-start'}
            >
              <button
                className="stepNode__Add plusButton nodrag"
                data-testid={'stepNode__appendStep-btn'}
              >
                <PlusIcon />
              </button>
            </Popover>
          )}
          {/* VISUAL REPRESENTATION OF STEP WITH ICON */}
          <div className={'stepNode__Icon stepNode__clickable'}>
            <img src={data.icon} alt={data.label} />
          </div>
          {/* STEP LABEL */}
          <div className={'stepNode__Label stepNode__clickable'}>{data.label}</div>
          {/* RIGHT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
          <Handle
            isConnectable={false}
            type="source"
            position={Position.Right}
            id="b"
            style={{ borderRadius: 0 }}
          />
        </div>
      ) : (
        <div
          className={'stepNode stepNode__Slot stepNode__clickable'}
          onDrop={onDropNew}
          data-testid={'viz-step-slot'}
        >
          <div className={'stepNode__Icon stepNode__clickable'}>
            <CubesIcon />
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id="b"
            style={{ borderRadius: 0 }}
            isConnectable={false}
          />
          <div className={'stepNode__Label stepNode__clickable'}>{data.label}</div>
        </div>
      )}
    </>
  );
};

export { VisualizationStep };
