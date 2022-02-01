import { IStepProps, IViewProps, IVizStepProps, IVizStepPropsEdge } from '../types';
import { StepErrorBoundary, StepViews } from './';
import './Visualization.css';
// @ts-ignore
import initialElements from './initial-elements';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import ReactFlow, {
  removeElements,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Elements,
  Connection,
  Edge,
} from 'react-flow-renderer';

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

const onLoad = (reactFlowInstance: { fitView: () => void }) => {
  reactFlowInstance.fitView();
};

const Visualization = ({
  deleteIntegrationStep,
  replaceIntegrationStep,
  steps,
  views,
}: IVisualization) => {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [selectedStep, setSelectedStep] = useState<IStepProps>(placeholderStep);

  // elements is an array of UI-specific objects that represent the Step model visually
  const [elements, setElements] = useState<IVizStepProps[]>([]);

  const onElementsRemove = (elementsToRemove: Elements<IVizStepProps[]>) =>
    setElements((els) => removeElements(elementsToRemove, els));

  const onConnect = (params: Edge<any> | Connection) => setElements((els) => addEdge(params, els));

  // Update visualization data when Steps change
  useEffect(() => {
    prepareAndSetVizDataSteps(steps);
  }, [steps]);

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

  /**
   * Creates an object for the Visualization from the Step model.
   * Contains UI-specific metadata (e.g. position).
   * Data is stored in the Elements hook.
   * @param steps
   */
  const prepareAndSetVizDataSteps = (steps: IStepProps[]) => {
    const incrementAmt = 100;
    const stepsAsElements: any[] = [];
    const stepEdges: any[] = [];

    steps.map((step, index) => {
      // Grab the previous step to use for determining position and drawing edges
      const previousStep = stepsAsElements[index - 1];

      // Build the default parameters
      let inputStep: IVizStepProps = {
        data: { label: step.name },
        id: step.UUID,
        position: { x: 0, y: 0 },
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
       * Determine position of step,
       * add properties accordingly
       */
      switch (index) {
        case 0:
          // First item in `steps` array
          inputStep = {
            ...inputStep,
            position: {
              x: 250,
              y: 0,
            },
            style: {
              background: '#D6D5E6',
              color: '#333',
              border: '1px solid #222138',
              width: 180,
            },
            type: 'input',
          };

          inputStep.data.label = (
            <>
              <strong>{step.name}</strong>
            </>
          );

          break;
        case steps.length - 1:
          // Last item in `steps` array
          inputStep = {
            ...inputStep,
            position: {
              x: 0,
              y: previousStep.position?.y + incrementAmt,
            },
            type: 'output',
          };

          // Build edges
          stepEdge.animated = true;
          stepEdge.style = { stroke: 'red' };

          break;
        default:
          // Middle steps in `steps` array
          inputStep.position.y = previousStep.position?.y + incrementAmt;

          // Build edges
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

  const deleteStep = () => {
    const selectedStepVizId = selectedStep.UUID;
    setIsPanelExpanded(false);
    setSelectedStep(placeholderStep);

    const stepsIndex = findStepIdxWithVizId(selectedStepVizId);
    deleteIntegrationStep(stepsIndex);
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

  const onExpandPanel = () => {
    //drawerRef.current && drawerRef.current.focus();
  };

  const onClosePanelClick = () => {
    setIsPanelExpanded(false);
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
            <div
              onDrop={(e: any) => {
                e.preventDefault();
                //const dataJSON = e.dataTransfer.getData('text');
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              style={{ width: window.innerWidth, height: window.innerHeight }}
            >
              <ReactFlow
                elements={elements}
                onElementsRemove={onElementsRemove}
                onConnect={onConnect}
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
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </StepErrorBoundary>
  );
};

export { Visualization };
