import './Visualization.css';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { memo, useCallback } from 'react';
import { Handle, Position, useStoreState } from 'react-flow-renderer';

// Custom Node type and component for React Flow
const VisualizationStep = memo(({ data }: any) => {
  const nodes = useStoreState((state) => state.nodes);
  const isLastNode = nodes[nodes.length - 1].data.UUID === data.UUID;

  const borderColor =
    data.connectorType === 'START'
      ? 'rgb(0, 136, 206)'
      : data.connectorType === 'END'
      ? 'rgb(149, 213, 245)'
      : 'rgb(204, 204, 204)';

  const onDropChange = useCallback((event) => data.onDropChange(event, data), [data]);

  return (
    <div
      className={'stepNode'}
      style={{ border: '2px solid ' + borderColor, borderRadius: '50%' }}
      onDrop={onDropChange}
    >
      {data.connectorType !== 'END' && !isLastNode && (
        <Handle type="source" position={Position.Right} id="b" style={{ borderRadius: 0 }} />
      )}
      {data.connectorType !== 'END' && isLastNode && (
        <div className={'stepNode__Add'}>
          <PlusCircleIcon
            onClick={() => {
              console.log('clicked!');
            }}
          />
        </div>
      )}
      <div className={'stepNode__Icon'}>
        <img src={data.icon} className="nodrag" alt={data.label} />
      </div>
      {data.connectorType !== 'START' && (
        <Handle type="target" position={Position.Left} id="a" style={{ borderRadius: 0 }} />
      )}
      <div className={'stepNode__Label'}>{data.label}</div>
    </div>
  );
});

export { VisualizationStep };
