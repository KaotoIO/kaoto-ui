import { IModelVizProps, IStepProps, IViewProps, IVizStepProps, IVizStepPropsEdge } from '../types';
import { StepErrorBoundary, StepViews } from './';
import './Visualization.css';
// @ts-ignore
import initialElements from './initial-elements';
//import initialElementsKaoto from './initial-elements-kaoto';
//import initialElementsKaoto from './initial-elements-kaoto-2';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import ReactFlow, {
  removeElements,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Elements,
} from 'react-flow-renderer';
import { v4 as uuidv4 } from 'uuid';

//import { v4 as uuidv4 } from 'uuid';

interface IVisualization {
  deleteIntegrationStep: (e: any) => void;
  isError?: boolean;
  isLoading?: boolean;
  replaceIntegrationStep: (newStep: any, oldStepIndex: any) => void;
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

const findIndexWithVizId = (vizId: any, steps: any[]) => {
  return steps.map((step: any) => step.viz.id).indexOf(vizId);
};

const onLoad = (reactFlowInstance: { fitView: () => void }) => {
  console.log('flow loaded:', reactFlowInstance);
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

  // vizData is a UI-specific mapping between the Step model and Visualization metadata
  const [vizData, setVizData] = useState<IVizStepProps[]>([]);

  const [elements, setElements] = useState(initialElements);
  // @ts-ignore
  const onElementsRemove = (elementsToRemove: Elements<any>) =>
    // @ts-ignore
    setElements((els) => removeElements(elementsToRemove, els));
  // @ts-ignore
  const onConnect = (params) => setElements((els) => addEdge(params, els));

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
   * Creates a mapping for the Visualization by
   * separating the Step Model from a new Viz object,
   * which contains UI-specific metadata (e.g. position).
   * Data is stored in the VizData hook.
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
        //id: uuidv4(),
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
    setVizData(combined);
    console.log(JSON.stringify(combined));
    //console.table(combined);
    //console.table(stepsAsElements);
    //console.table(stepEdges);
  };

  const deleteStep = () => {
    const selectedStepVizId = selectedStep.id;
    setIsPanelExpanded(false);
    setSelectedStep(placeholderStep);

    const stepsIndex = findIndexWithVizId(selectedStepVizId, steps);
    deleteIntegrationStep(stepsIndex);
  };

  const saveConfig = (newValues: { [s: string]: unknown } | ArrayLike<unknown>) => {
    const selectedStepVizId = selectedStep.id;
    let newStep: IStepProps = selectedStep;
    const newStepParameters = newStep.parameters;

    if (newStepParameters && newStepParameters.length > 0) {
      Object.entries(newValues).map(([key, value]) => {
        const paramIndex = newStepParameters.findIndex((p) => p.id === key);
        newStepParameters[paramIndex!].value = value;
      });

      // "old step index" is the same as the current step index
      replaceIntegrationStep(newStep, selectedStepVizId);
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
              views={views.filter((view) => view.step === selectedStep.model.UUID)}
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
                //elements={steps}
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
