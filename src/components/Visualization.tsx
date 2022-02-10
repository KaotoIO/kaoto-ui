import {
  fetchCustomResource,
  fetchViewDefinitions,
  useStepsAndViewsContext,
  useYAMLContext,
} from '../api';
import { IStepProps, IVizStepProps, IVizStepPropsEdge } from '../types';
import truncateString from '../utils/truncateName';
import usePrevious from '../utils/usePrevious';
import { StepErrorBoundary, StepViews } from './';
import './Visualization.css';
import { AlertVariant, Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Elements,
  Handle,
  MiniMap,
  Position,
  ReactFlowProvider,
  removeElements,
} from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';
import 'react-flow-renderer/dist/theme-default.css';
import { v4 as uuidv4 } from 'uuid';

const placeholderStep: IStepProps = {
  apiVersion: '',
  icon: '',
  id: '',
  name: '',
  parameters: [],
  type: '',
  UUID: '',
};

let id = 0;
const getId = () => `dndnode_${id++}`;

/**
 * Returns a Step index when provided with the `UUID`.
 * `UUID` is originally set using the Step UUID.
 * @param UUID
 * @param steps
 */
const findStepIdxWithUUID = (UUID: string, steps: IStepProps[]) => {
  return steps.map((s) => s.UUID).indexOf(UUID);
};

// Custom Node type and component for React Flow
const CustomNodeComponent = ({ data }: any) => {
  const [viewData, dispatch] = useStepsAndViewsContext();

  const borderColor =
    data.connectorType === 'START'
      ? 'rgb(0, 136, 206)'
      : data.connectorType === 'END'
      ? 'rgb(149, 213, 245)'
      : 'rgb(204, 204, 204)';

  const onDrop = (e: any) => {
    const dataJSON = e.dataTransfer.getData('text');
    const step: IStepProps = JSON.parse(dataJSON);
    // Replace step
    dispatch({ type: 'REPLACE_STEP', payload: { newStep: step, oldStepIndex: data.index } });
    // should I hold off on this dispatch?
    // TODO: fetch the updated view definitions again with new views
    // only really necessary for step replacement though..
    // hopefully this is up-to-date. EDIT: it is, but not the views or UUID..
    // console.table(viewData);
    fetchViewDefinitions(viewData.steps).then((data: any) => {
      console.log('fetched view definitions again..');
      console.table(data);
      // dispatch({ type: "UPDATE_INTEGRATION", payload:  });
    });
  };

  return (
    <div
      className={'stepNode'}
      style={{ border: '2px solid ' + borderColor, borderRadius: '50%' }}
      onDrop={onDrop}
    >
      {!(data.connectorType === 'START') && (
        <Handle type="target" position={Position.Left} id="a" style={{ borderRadius: 0 }} />
      )}
      <div className={'stepNode__Icon'}>
        <img src={data.icon} className="nodrag" />
      </div>
      {!(data.connectorType === 'END') && (
        <Handle type="source" position={Position.Right} id="b" style={{ borderRadius: 0 }} />
      )}
      <div className={'stepNode__Label'}>{data.label}</div>
    </div>
  );
};

const Visualization = () => {
  // `elements` is an array of UI-specific objects that represent the Step model visually
  const [elements, setElements] = useState<IVizStepProps[]>([]);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [selectedStep, setSelectedStep] = useState<IStepProps>(placeholderStep);
  const [, setYAMLData] = useYAMLContext();
  const [viewData, dispatch] = useStepsAndViewsContext();
  const previousViewData = usePrevious(viewData);

  const { addAlert } = useAlert() || {};

  useEffect(() => {
    if (previousViewData === viewData) {
      return;
    }

    fetchCustomResource(viewData.steps)
      .then((value: string | void) => {
        // update state of YAML editor
        if (value) {
          // update the state of the YAML editor with the custom resource
          setYAMLData(value);
        }
      })
      .catch((e) => {
        console.log(e);
        addAlert &&
          addAlert({
            title: 'Something went wrong',
            variant: AlertVariant.danger,
            description: 'There was a problem updating the integration. Please try again later.',
          });
      });

    prepareAndSetVizDataSteps(viewData.steps);
  }, [viewData]);

  const nodeTypes = {
    special: CustomNodeComponent,
  };

  /**
   * Creates an object for the Visualization from the Step model.
   * Contains UI-specific metadata (e.g. position).
   * Data is stored in the Elements hook.
   * @param steps
   */
  const prepareAndSetVizDataSteps = (steps: IStepProps[]) => {
    const incrementAmt = 160;
    const stepsAsElements: any[] = [];
    const stepEdges: any[] = [];

    steps.map((step, index) => {
      // Grab the previous step to use for determining position and drawing edges
      const previousStep = stepsAsElements[index - 1];
      let stepEdge: IVizStepPropsEdge = { id: '' };

      // Build the default parameters
      let inputStep: IVizStepProps = {
        data: {
          connectorType: step.type,
          icon: step.icon,
          // custom generated uuid as a reference fallback
          id: uuidv4(),
          index: index,
          label: truncateString(step.name, 14),
          temporary: false,
          UUID: step.UUID,
        },
        id: getId(),
        position: { x: 0, y: window.innerHeight / 2 },
        type: 'special',
      };

      // Add edge properties if more than one step, and not on first step
      if (steps.length > 1 && index !== 0) {
        stepEdge.arrowHeadType = 'arrowclosed';
        stepEdge.id = 'e' + previousStep.id + '-' + inputStep.id;
        stepEdge.source = previousStep.id;

        // even the last step needs to build the step edge above it, with itself as the target
        stepEdge.target = inputStep.id;
      }

      // TODO: Check with localStorage to see if positions already exist

      /**
       * Determine position of Step,
       * add properties accordingly
       */
      switch (index) {
        case 0:
          // First item in `steps` array
          inputStep.position.x = window.innerWidth / 5;
          break;
        case steps.length - 1:
          // Last item in `steps` array
          inputStep.position.x = previousStep.position?.x + incrementAmt;

          // Build edges
          stepEdge.animated = true;
          stepEdge.style = { stroke: 'red' };
          break;
        default:
          // Middle steps in `steps` array
          inputStep.position.x = previousStep.position?.x + incrementAmt;
          break;
      }

      stepsAsElements.push(inputStep);

      // Only add step edge if there is more than one step and not on the first step
      if (steps.length > 1 && index !== 0) {
        stepEdges.push(stepEdge);
      }

      return;
    });

    // combine steps and step edges before setting hook state
    const combined = stepsAsElements.concat(stepEdges);
    setElements(combined);
  };

  /**
   * Delete an integration step
   */
  const deleteStep = () => {
    setIsPanelExpanded(false);
    setSelectedStep(placeholderStep);

    const stepsIndex = findStepIdxWithUUID(selectedStep.UUID, viewData.steps);
    dispatch({ type: 'DELETE_STEP', payload: { index: stepsIndex } });
  };

  const onClosePanelClick = () => {
    setIsPanelExpanded(false);
  };

  const onConnect = (params: Edge<any> | Connection) => {
    // @ts-ignore
    setElements((els) => addEdge(params, els));
  };

  const onDragOver = (event: {
    preventDefault: () => void;
    dataTransfer: { dropEffect: string };
  }) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: {
    preventDefault: () => void;
    dataTransfer: { getData: (arg0: string) => any };
    clientX: number;
    clientY: number;
  }) => {
    // TODO: Check if there is an existing node??
    event.preventDefault();

    // @ts-ignore
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const dataJSON = event.dataTransfer.getData('text');
    const step: IStepProps = JSON.parse(dataJSON);

    // @ts-ignore
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: getId(),
      type,
      position,
      data: {
        connectorType: step.type,
        icon: step.icon,
        // custom generated uuid as a reference fallback
        id: uuidv4(),
        label: `${truncateString(step.name, 14)}`,
        temporary: true,
        // generated from the backend
        UUID: step.UUID,
      },
    };

    setElements((es) => es.concat(newNode));
  };

  const onElementClick = (_e: any, element: any) => {
    // prevent temporary steps from being selected for now
    //console.table(element.data);
    if (!element.data.UUID) {
      return;
    }

    // Only set state again if the ID is not the same
    if (selectedStep.UUID !== element.data.UUID) {
      const findStep: IStepProps =
        viewData.steps.find((step) => step.UUID === element.data.UUID) ?? selectedStep;
      setSelectedStep(findStep);
    }

    setIsPanelExpanded(!isPanelExpanded);
  };

  const onElementsRemove = (elementsToRemove: Elements<IVizStepProps[]>) =>
    setElements((els) => removeElements(elementsToRemove, els));

  const onExpandPanel = () => {
    //drawerRef.current && drawerRef.current.focus();
  };

  const onLoad = (_reactFlowInstance: any) => {
    setReactFlowInstance(_reactFlowInstance);
  };

  const saveConfig = (newValues: { [s: string]: unknown } | ArrayLike<unknown>) => {
    let newStep: IStepProps = selectedStep;
    const newStepParameters = newStep.parameters;

    if (newStepParameters && newStepParameters.length > 0) {
      Object.entries(newValues).map(([key, value]) => {
        const paramIndex = newStepParameters.findIndex((p) => p.id === key);
        newStepParameters[paramIndex!].value = value;
      });

      // TODO: this won't work for temporary steps because they don't have a UUID
      const oldStepIdx = findStepIdxWithUUID(selectedStep.UUID, viewData.steps);
      // Replace step with new step
      dispatch({ type: 'REPLACE_STEP', payload: { newStep, oldStepIndex: oldStepIdx } });
    } else {
      return;
    }
  };

  return (
    <StepErrorBoundary>
      <Drawer isExpanded={isPanelExpanded} onExpand={onExpandPanel}>
        <DrawerContent
          panelContent={
            <StepViews
              step={selectedStep}
              isPanelExpanded={isPanelExpanded}
              deleteStep={deleteStep}
              onClosePanelClick={onClosePanelClick}
              saveConfig={saveConfig}
              views={viewData?.views.filter((view) => view.step === selectedStep.UUID)}
            />
          }
          className={'panelCustom'}
        >
          <DrawerContentBody>
            <ReactFlowProvider>
              <div
                className="reactflow-wrapper"
                ref={reactFlowWrapper}
                style={{ width: window.innerWidth, height: window.innerHeight }}
              >
                <ReactFlow
                  elements={elements}
                  nodeTypes={nodeTypes}
                  onConnect={onConnect}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onElementClick={onElementClick}
                  onElementsRemove={onElementsRemove}
                  onLoad={onLoad}
                  snapToGrid={true}
                  snapGrid={[15, 15]}
                >
                  <MiniMap
                    nodeStrokeColor={(n) => {
                      if (n.style?.background) return n.style.background;
                      if (n.type === 'input') return '#0041d0';
                      if (n.type === 'output') return '#ff0072';
                      if (n.type === 'default') return '#1a192b';

                      return '#eee';
                    }}
                    nodeColor={(n) => {
                      if (n.style?.background) return n.style.background;

                      return '#fff';
                    }}
                    nodeBorderRadius={2}
                  />
                  <Controls />
                  <Background color="#aaa" gap={16} />
                </ReactFlow>
              </div>
            </ReactFlowProvider>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </StepErrorBoundary>
  );
};

export { Visualization };
