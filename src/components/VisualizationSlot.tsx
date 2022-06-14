import {
  fetchCustomResource,
  fetchViewDefinitions,
  useStepsAndViewsContext,
  useYAMLContext,
} from '../api';
import { IStepProps, IViewData, IVizStepNodeData } from '../types';
import { canStepBeReplaced } from '../utils/validationService';
import './Visualization.css';
import { AlertVariant } from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { Handle, Position } from 'react-flow-renderer';

export interface IVisualizationSlot {
  data: IVizStepNodeData;
}

// Custom Node type and component for React Flow
const VisualizationSlot = ({ data }: IVisualizationSlot) => {
  const [viewData, dispatch] = useStepsAndViewsContext();
  const [, setYAMLData] = useYAMLContext();
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
      fetchViewDefinitions(viewData.steps).then((newViewDefs: IViewData) => {
        dispatch({ type: 'UPDATE_INTEGRATION', payload: newViewDefs });

        fetchCustomResource(
          newViewDefs.steps.filter((step: IStepProps) => step.type),
          data.settings.integrationName
        )
          .then((value) => {
            if (typeof value === 'string') {
              setYAMLData(value);
            } else {
              setYAMLData('');
            }
          })
          .catch((e) => {
            console.error(e);
            addAlert &&
              addAlert({
                title: 'Something went wrong',
                variant: AlertVariant.danger,
                description:
                  'There was a problem updating the integration. Please try again later.',
              });
          });
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
      className={'stepNode stepNode__clickable'}
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
      <div className={'stepNode__Icon stepNode__clickable'}>
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
      <div className={'stepNode__Label stepNode__clickable'}>{data.label}</div>
    </div>
  );
};

export { VisualizationSlot };
