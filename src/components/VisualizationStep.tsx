import { IVizStepNodeData } from '../types';
import { appendableStepTypes } from '../utils/validationService';
import { MiniCatalog } from './MiniCatalog';
import './Visualization.css';
import { Button, Popover } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Handle, Node, NodeProps, Position, useNodes } from 'react-flow-renderer';

// Custom Node type and component for React Flow
const VisualizationStep = ({ data }: NodeProps<IVizStepNodeData>) => {
  const nodes: Node[] = useNodes();
  const isLastNode = nodes[nodes.length - 1].data.UUID === data.UUID;
  // const updateNodeColor = useStore((state) => state.updateNodeColor);

  const borderColor =
    data.connectorType === 'START'
      ? 'rgb(0, 136, 206)'
      : data.connectorType === 'END'
      ? 'rgb(149, 213, 245)'
      : 'rgb(204, 204, 204)';

  const onDropChange = (event: any) => {
    data.onDropChange(event, data);
  };
  const onMiniCatalogClickAdd = (selectedStep: any) => data.onMiniCatalogClickAdd(selectedStep);

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
                dsl: data.dsl,
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

      {/* VISUAL REPRESENTATION OF STEP WITH ICON */}
      <div className={'stepNode__Icon stepNode__clickable'}>
        <img src={data.icon} alt={data.label} />
      </div>

      {/* TEST EXAMPLE W/ COLOR */}
      {/*<div style={{ padding: 20 }}>*/}
      {/*  <input*/}
      {/*    type="color"*/}
      {/*    defaultValue={data.color}*/}
      {/*    onChange={(evt) => updateNodeColor(id, evt.target.value)}*/}
      {/*    className="nodrag"*/}
      {/*  />*/}
      {/*</div>*/}

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
