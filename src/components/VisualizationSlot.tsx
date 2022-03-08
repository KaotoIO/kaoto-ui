import { fetchViewDefinitions, useStepsAndViewsContext } from '../api';
import { IStepProps } from '../types';
import { canStepBeReplaced } from '../utils/validationService';
import './Visualization.css';
import { AlertVariant } from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { Handle, Position } from 'react-flow-renderer';

// Custom Node type and component for React Flow
const VisualizationSlot = ({ data }: any) => {
  const [viewData, dispatch] = useStepsAndViewsContext();
  const { addAlert } = useAlert() || {};

  /**
   * Handles dropping a step onto a slot
   * @param e
   */
  const onDrop = (e: { dataTransfer: { getData: (arg0: string) => any } }) => {
    const dataJSON = e.dataTransfer.getData('text');
    const step: IStepProps = JSON.parse(dataJSON);
    const validation = canStepBeReplaced(data, step, viewData.steps);

    if (validation.isValid) {
      // update the steps, the new node will be created automatically
      dispatch({ type: 'REPLACE_STEP', payload: { newStep: step, oldStepIndex: data.index } });
      // fetch the updated view definitions again with new views
      fetchViewDefinitions(viewData.steps).then((data: any) => {
        dispatch({ type: 'UPDATE_INTEGRATION', payload: data });
      });
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
    <div
      className={'stepNode'}
      style={{ border: '2px solid rgb(149, 213, 245)', borderRadius: '50%' }}
      onDrop={onDrop}
    >
      {!(data.connectorType === 'START') && (
        <Handle
          type="target"
          position={Position.Left}
          id="a"
          style={{ borderRadius: 0 }}
          isConnectable={false}
        />
      )}
      <div className={'stepNode__Icon'}>
        <CubesIcon />
      </div>
      {!(data.connectorType === 'END') && (
        <Handle
          type="source"
          position={Position.Right}
          id="b"
          style={{ borderRadius: 0 }}
          isConnectable={false}
        />
      )}
      <div className={'stepNode__Label'}>{data.label}</div>
    </div>
  );
};

export { VisualizationSlot };
