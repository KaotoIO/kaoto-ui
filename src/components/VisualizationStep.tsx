import { MiniCatalog } from './MiniCatalog';
import './Visualization.css';
import { Button, Popover } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Handle, Position, useStoreState } from 'react-flow-renderer';

// Custom Node type and component for React Flow
const VisualizationStep = ({ data }: any) => {
  const nodes = useStoreState((state) => state.nodes);
  const isLastNode = nodes[nodes.length - 1].data.UUID === data.UUID;

  const borderColor =
    data.connectorType === 'START'
      ? 'rgb(0, 136, 206)'
      : data.connectorType === 'END'
      ? 'rgb(149, 213, 245)'
      : 'rgb(204, 204, 204)';

  const onDropChange = (event: any) => data.onDropChange(event, data);
  const onElementClick = (event: any) => data.onElementClick(event, data);
  const onElementClickAdd = (event: any) => {
    data.onElementClickAdd(event, data);
  };

  return (
    <>
      <div
        className={'stepNode'}
        style={{ border: '2px solid ' + borderColor, borderRadius: '50%' }}
        onDrop={onDropChange}
      >
        {data.connectorType !== 'END' && !isLastNode && (
          <Handle type="source" position={Position.Right} id="b" style={{ borderRadius: 0 }} />
        )}
        {data.connectorType !== 'END' && isLastNode && (
          <Popover
            aria-label="Advanced popover usages example"
            position={'auto'}
            hideOnOutsideClick={true}
            enableFlip={true}
            appendTo={() => document.body}
            bodyContent={<MiniCatalog />}
          >
            <div className={'stepNode__Add'} onClick={onElementClickAdd}>
              <Button variant="plain" aria-label="Action">
                <PlusCircleIcon />
              </Button>
            </div>
          </Popover>
        )}
        <div className={'stepNode__Icon'} onClick={onElementClick}>
          <img src={data.icon} className="nodrag" alt={data.label} />
        </div>
        {data.connectorType !== 'START' && (
          <Handle type="target" position={Position.Left} id="a" style={{ borderRadius: 0 }} />
        )}
        <div className={'stepNode__Label'} onClick={onElementClick}>
          {data.label}
        </div>
      </div>
    </>
  );
};

export { VisualizationStep };
