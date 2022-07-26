import { useSettingsStore } from '../store';
import { IStepProps, IVizStepNodeData } from '../types';
import { findStepIdxWithUUID } from '../utils';
import { appendableStepTypes, insertableStepTypes } from '../utils';
import { MiniCatalog } from './MiniCatalog';
import './Visualization.css';
import { Button, Popover } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Handle, Node, NodeProps, Position, useNodes } from 'react-flow-renderer';

const currentDSL = useSettingsStore.getState().settings.dsl;

// Custom Node type and component for React Flow
const VisualizationStep = ({ data }: NodeProps<IVizStepNodeData>) => {
  const nodes: Node[] = useNodes();
  const isLastNode = nodes[nodes.length - 1].data.UUID === data.UUID;
  // this step will always have a UUID
  const currentIdx = findStepIdxWithUUID(data.UUID!);

  const borderColor =
    data.connectorType === 'START'
      ? 'rgb(0, 136, 206)'
      : data.connectorType === 'END'
      ? 'rgb(149, 213, 245)'
      : 'rgb(204, 204, 204)';

  const onDropChange = (event: any) => {
    data.onDropChange(event, data);
  };

  const onMiniCatalogClickAdd = (selectedStep: IStepProps) =>
    data.onMiniCatalogClickAdd(selectedStep);

  const onMiniCatalogClickInsert = (selectedStep: IStepProps) => {
    data.onMiniCatalogClickInsert(selectedStep, currentIdx);
  };

  return (
    <div
      className={'stepNode'}
      style={{ border: '2px solid ' + borderColor, borderRadius: '50%' }}
      onDrop={onDropChange}
    >
      {/* LEFT EDGE */}
      {data.connectorType !== 'END' && !isLastNode && (
        <Handle
          isConnectable={false}
          type="source"
          position={Position.Right}
          id="b"
          style={{ borderRadius: 0 }}
        />
      )}

      {/* PLUS BUTTON TO ADD STEP */}
      {data.connectorType !== 'END' && isLastNode && (
        <Popover
          appendTo={() => document.body}
          aria-label="Search for a step"
          bodyContent={
            <MiniCatalog
              handleSelectStep={onMiniCatalogClickAdd}
              queryParams={{
                dsl: currentDSL,
                type: appendableStepTypes(data.connectorType),
              }}
            />
          }
          enableFlip={true}
          flipBehavior={['top-start', 'left-start']}
          hideOnOutsideClick={true}
          position={'right-start'}
        >
          <div className={'stepNode__Add nodrag'}>
            <Button variant="plain" aria-label="Action">
              <PlusCircleIcon />
            </Button>
          </div>
        </Popover>
      )}

      {/* PLUS BUTTON TO INSERT STEP */}
      {data.connectorType !== 'START' && (
        <Popover
          appendTo={() => document.body}
          aria-label="Search for a step"
          bodyContent={
            <MiniCatalog
              handleSelectStep={onMiniCatalogClickInsert}
              queryParams={{
                dsl: currentDSL,
                type: insertableStepTypes(nodes[currentIdx - 1]?.data, nodes[currentIdx]?.data),
              }}
            />
          }
          enableFlip={true}
          flipBehavior={['top-start', 'left-start']}
          hideOnOutsideClick={true}
          position={'right-start'}
        >
          <div className={'stepNode__Insert nodrag'}>
            <Button variant="plain" aria-label="Action">
              <PlusCircleIcon />
            </Button>
          </div>
        </Popover>
      )}

      {/* VISUAL REPRESENTATION OF STEP WITH ICON */}
      <div className={'stepNode__Icon stepNode__clickable'}>
        <img src={data.icon} alt={data.label} />
      </div>

      {/* RIGHT EDGE */}
      {data.connectorType !== 'START' && (
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
  );
};

export { VisualizationStep };
