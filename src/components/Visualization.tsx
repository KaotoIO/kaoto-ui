import { IStepProps, IViewProps, IVizStepProps, IVizStepPropsEdge } from '../types';
import truncateString from '../utils/truncateName';
import { StepErrorBoundary, StepViews } from './';
import './Visualization.css';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
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

interface IVisualization {
  deleteIntegrationStep: (stepsIndex: number) => void;
  isError?: boolean;
  isLoading?: boolean;
  replaceIntegrationStep: (newStep: IStepProps, oldStepIndex: number) => void;
  steps: IStepProps[];
  views: IViewProps[];
}

const placeholderStep: IStepProps = {
  apiVersion: '',
  icon: '',
  id: '',
  name: '',
  parameters: [],
  type: '',
  UUID: '',
};

const CustomNodeComponent = ({ data }) => {
  return (
    <div className={'stepNode'}>
      {!(data.data?.connectorType === 'START') && (
        <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
      )}
      <div className={'stepNode__Icon'}>
        <img src={data.icon} />
      </div>
      {!(data.data?.connectorType === 'END') && (
        <Handle type="source" position={Position.Bottom} id="b" style={{ borderRadius: 0 }} />
      )}
      <div className={'stepNode__Label'}>{data.label}</div>
    </div>
  );
};

const nodeTypes = {
  special: CustomNodeComponent,
};

const Visualization = ({
  deleteIntegrationStep,
  replaceIntegrationStep,
  steps,
  views,
}: IVisualization) => {
  // elements is an array of UI-specific objects that represent the Step model visually
  const [elements, setElements] = useState<IVizStepProps[]>([]);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [selectedStep, setSelectedStep] = useState<IStepProps>(placeholderStep);

  // Update visualization data when Steps change
  useEffect(() => {
    prepareAndSetVizDataSteps(steps);
  }, [steps]);

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

      // Build the default parameters
      let inputStep: IVizStepProps = {
        data: { connectorType: step.type, icon: step.icon, label: step.name },
        id: step.UUID,
        position: { x: window.innerWidth / 2, y: 0 },
        type: 'special',
      };

      let stepEdge: IVizStepPropsEdge = {
        id: '',
      };

      // Add edge properties if more than one step, and not on first step
      if (steps.length > 1 && index !== 0) {
        stepEdge.arrowHeadType = 'arrowclosed';
        stepEdge.id = 'e' + previousStep.id + '-' + inputStep.id;
        stepEdge.source = previousStep.id;

        // even the last step needs to build the step edge above it, with itself as the target
        stepEdge.target = inputStep.id;
      }

      // Check with localStorage to see if positions already exist

      /**
       * Determine position of Step,
       * add properties accordingly
       */
      switch (index) {
        case 0:
          // First item in `steps` array
          inputStep.position.y = window.innerHeight / 2;
          break;
        case steps.length - 1:
          // Last item in `steps` array
          inputStep.position.y = previousStep.position?.y + incrementAmt;

          // Build edges
          stepEdge.animated = true;
          stepEdge.style = { stroke: 'red' };
          break;
        default:
          // Middle steps in `steps` array
          inputStep.position.y = previousStep.position?.y + incrementAmt;
          stepEdge = {
            ...stepEdge,
            label: 'cheese',
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 4,
            labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
          };
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
   * Returns a Step when provided with the `vizId`.
   * `vizId` is originally set using the Step UUID.
   * @param vizId
   */
  const findStepWithVizId = (vizId: string) => {
    return steps.find((s) => s.id === vizId);
  };

  /**
   * Returns a Step index when provided with the `vizId`.
   * `vizId` is originally set using the Step UUID.
   * @param vizId
   */
  const findStepIdxWithVizId = (vizId: string) => {
    return steps.map((s) => s.id).indexOf(vizId);
  };

  const deleteStep = () => {
    const selectedStepVizId = selectedStep.UUID;
    setIsPanelExpanded(false);
    setSelectedStep(placeholderStep);

    const stepsIndex = findStepIdxWithVizId(selectedStepVizId);
    deleteIntegrationStep(stepsIndex);
  };

  const onClosePanelClick = () => {
    setIsPanelExpanded(false);
  };

  const onConnect = (params: Edge<any> | Connection) => setElements((els) => addEdge(params, els));

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
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');

    const dataJSON = event.dataTransfer.getData('text');
    const parsed: IStepProps = JSON.parse(dataJSON);

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: parsed.UUID,
      type,
      position,
      data: { label: `${parsed.title} node` },
    };

    setElements((es) => es.concat(newNode));
  };

  const onElementClick = (_e: any, element: any) => {
    //console.table(element);
    if (!element.id) {
      return;
    }

    // Only set state again if the ID is not the same
    if (selectedStep.UUID !== element.id) {
      const findStep: IStepProps = steps.find((step) => step.UUID === element.id) ?? selectedStep;
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
    _reactFlowInstance.fitView();
    setReactFlowInstance(_reactFlowInstance);
  };

  const saveConfig = (newValues: { [s: string]: unknown } | ArrayLike<unknown>) => {
    const selectedStepUUID = selectedStep.UUID;
    let newStep: IStepProps = selectedStep;
    const newStepParameters = newStep.parameters;

    if (newStepParameters && newStepParameters.length > 0) {
      Object.entries(newValues).map(([key, value]) => {
        const paramIndex = newStepParameters.findIndex((p) => p.id === key);
        newStepParameters[paramIndex!].value = value;
      });

      const selectedStepIdx = findStepIdxWithVizId(selectedStepUUID);
      replaceIntegrationStep(newStep, selectedStepIdx);
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
              views={views.filter((view) => view.step === selectedStep.UUID)}
            />
          }
          className={'panelCustom'}
        >
          <DrawerContentBody>
            {/** Wrapper to handle steps (DOM elements) dropped from catalog **/}
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
