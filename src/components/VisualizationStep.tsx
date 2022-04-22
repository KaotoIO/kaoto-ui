import { appendableStepTypes } from '../utils/validationService';
import { MiniCatalog } from './MiniCatalog';
import './Visualization.css';
import { Button, Popover } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Handle, Position, useStoreState } from 'react-flow-renderer';
import { IVizStepNodeData } from '../types';

export interface IVisualizationStep {
  data: IVizStepNodeData;
}

// Custom Node type and component for React Flow
const VisualizationStep = ({ data }: IVisualizationStep) => {
  const nodes = useStoreState((state: { nodes: any }) => state.nodes);
  const isLastNode = nodes[nodes.length - 1].data.UUID === data.UUID;

  const borderColor =
    data.connectorType === 'START'
      ? 'rgb(0, 136, 206)'
      : data.connectorType === 'END'
      ? 'rgb(149, 213, 245)'
      : 'rgb(204, 204, 204)';

  const onDropChange = (event: any) => data.onDropChange(event, data);
  const onElementClickAdd = (selectedStep: any) => data.onElementClickAdd(selectedStep);

  return (
    <div
      className={'stepNode'}
      style={{ border: '2px solid ' + borderColor, borderRadius: '50%' }}
      onDrop={onDropChange}
    >
      {data.connectorType !== 'END' && !isLastNode && (
        <Handle
          isConnectable={false}
          type="source"
          position={Position.Right}
          id="b"
          style={{ borderRadius: 0 }}
        />
      )}
      {data.connectorType !== 'END' && isLastNode && (
        <Popover
          appendTo={() => document.body}
          aria-label="Search for a step"
          bodyContent={
            <MiniCatalog
              handleSelectStep={onElementClickAdd}
              queryParams={{
                dsl: 'KameletBinding',
                kind: data.kind,
                type: appendableStepTypes(data.connectorType),
              }}
            />
          }
          enableFlip={false}
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
      <div className={'stepNode__Icon'}>
        <img src={data.icon} alt={data.label} />
      </div>
      {data.connectorType !== 'START' && (
        <Handle
          isConnectable={false}
          type="target"
          position={Position.Left}
          id="a"
          style={{ borderRadius: 0 }}
        />
      )}
      <div className={'stepNode__Label'}>{data.label}</div>
    </div>
  );
};

export { VisualizationStep };
