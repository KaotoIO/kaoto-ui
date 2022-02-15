import { fetchViewDefinitions, useStepsAndViewsContext } from '../api';
import { IStepProps } from '../types';
import { canStepBeDropped } from '../utils/validationService';
import './Visualization.css';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import { Handle, Position } from 'react-flow-renderer';

// Custom Node type and component for React Flow
const VisualizationSlot = ({ data }: any) => {
  const [viewData, dispatch] = useStepsAndViewsContext();

  /**
   * Step replacement onto existing integration step
   * @param e
   */
  const onDrop = (e: { dataTransfer: { getData: (arg0: string) => any } }) => {
    const dataJSON = e.dataTransfer.getData('text');
    const step: IStepProps = JSON.parse(dataJSON);
    // Check with validation first
    // canStepBeDropped(existingStep, proposedStep)

    // Replace step
    dispatch({ type: 'REPLACE_STEP', payload: { newStep: step, oldStepIndex: data.index } });
    // fetch the updated view definitions again with new views
    fetchViewDefinitions(viewData.steps).then((data: any) => {
      dispatch({ type: 'UPDATE_INTEGRATION', payload: data });
    });
  };

  return (
    <div
      className={'stepNode'}
      style={{ border: '2px solid rgb(149, 213, 245)', borderRadius: '50%' }}
      onDrop={onDrop}
    >
      {!(data.connectorType === 'START') && (
        <Handle type="target" position={Position.Left} id="a" style={{ borderRadius: 0 }} />
      )}
      <div className={'stepNode__Icon'}>
        <CubesIcon />
      </div>
      {!(data.connectorType === 'END') && (
        <Handle type="source" position={Position.Right} id="b" style={{ borderRadius: 0 }} />
      )}
      <div className={'stepNode__Label'}>{data.label}</div>
    </div>
  );
};

export { VisualizationSlot };
