import { useIntegrationJsonStore, useSettingsStore } from '../store';
import { canStepBeReplaced, findStepIdxWithUUID } from '../utils';
import { appendableStepTypes } from '../utils';
import { MiniCatalog } from './MiniCatalog';
import './Visualization.css';
import { IStepProps, IVizStepNodeData } from '@kaoto';
import { AlertVariant, Popover } from '@patternfly/react-core';
import { CubesIcon, PlusIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { Handle, Node, NodeProps, Position, useNodes } from 'react-flow-renderer';

const currentDSL = useSettingsStore.getState().settings.dsl;
const addStep = useIntegrationJsonStore.getState().addStep;
const replaceStep = useIntegrationJsonStore.getState().replaceStep;

// Custom Node type and component for React Flow
const VisualizationStep = ({ data }: NodeProps<IVizStepNodeData>) => {
  const nodes: Node[] = useNodes();
  const isLastNode = nodes[nodes.length - 1].data.UUID === data.UUID;
  // this step will always have a UUID
  const currentIdx = findStepIdxWithUUID(data.UUID!);
  const steps = useIntegrationJsonStore((state) => state.integrationJson.steps);

  const { addAlert } = useAlert() || {};

  const onMiniCatalogClickAdd = (selectedStep: IStepProps) => addStep(selectedStep);

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
      console.log('step CANNOT be replaced');
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
          {/* LEFT EDGE */}
          {data.step.type !== 'END' && !isLastNode && (
            <Handle
              isConnectable={false}
              type="source"
              position={Position.Right}
              id="b"
              style={{ borderRadius: 0 }}
            />
          )}

          {/* PLUS BUTTON TO ADD STEP */}
          {data.step.type !== 'END' && isLastNode && (
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
              <button className="stepNode__Add plusButton nodrag">
                <PlusIcon />
              </button>
            </Popover>
          )}

          {/* VISUAL REPRESENTATION OF STEP WITH ICON */}
          <div className={'stepNode__Icon stepNode__clickable'}>
            <img src={data.icon} alt={data.label} />
          </div>

          {/* RIGHT EDGE */}
          {data.step.type !== 'START' && (
            <Handle
              isConnectable={false}
              type="target"
              position={Position.Left}
              id="a"
              style={{ borderRadius: 0 }}
            />
          )}

          {/* STEP LABEL */}
          <div className={'stepNode__Label stepNode__clickable'}>{data.label}</div>
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
