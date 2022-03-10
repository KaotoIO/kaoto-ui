import {
  fetchCustomResource,
  fetchViewDefinitions,
  useStepsAndViewsContext,
  useYAMLContext,
} from '../api';
import { IStepProps, IViewData, IVizStepProps, IVizStepPropsEdge } from '../types';
import { findStepIdxWithUUID, truncateString, usePrevious } from '../utils';
import '../utils';
import { canStepBeReplaced } from '../utils/validationService';
import { StepErrorBoundary, StepViews, VisualizationSlot, VisualizationStep } from './';
import './Visualization.css';
import { AlertVariant, Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Elements,
  MiniMap,
  ReactFlowProvider,
  removeElements,
} from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';
import 'react-flow-renderer/dist/theme-default.css';

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

interface IVisualization {
  initialState?: IViewData;
  toggleCatalog?: () => void;
}

const Visualization = ({}: IVisualization) => {
  // `elements` is an array of UI-specific objects that represent the Step model visually
  const [elements, setElements] = useState<Elements<IStepProps>>([]);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [, setReactFlowInstance] = useState(null);
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

    // Remove all "Add Step" placeholders before updating the API
    fetchCustomResource(viewData.steps.filter((step) => step.type))
      .then((value: string | void) => {
        if (value) {
          setYAMLData(value);
        } else {
          setYAMLData('');
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
    slot: VisualizationSlot,
    step: VisualizationStep,
  };

  /**
   * Handles dropping a step onto an existing step (i.e. step replacement)
   * @param event
   * @param data
   */
  const onDropChange = (
    event: { preventDefault: () => void; dataTransfer: { getData: (arg0: string) => any } },
    data: any
  ) => {
    event.preventDefault();

    const dataJSON = event.dataTransfer.getData('text');
    const step: IStepProps = JSON.parse(dataJSON);
    const validation = canStepBeReplaced(data, step, viewData.steps);

    // Replace step
    if (validation.isValid) {
      // update the steps, the new node will be created automatically
      dispatch({
        type: 'REPLACE_STEP',
        payload: { newStep: step, oldStepIndex: findStepIdxWithUUID(data.UUID, viewData.steps) },
      });
      // fetch the updated view definitions again with new views
      fetchViewDefinitions(viewData.steps).then((data: any) => {
        dispatch({ type: 'UPDATE_INTEGRATION', payload: data });
      });
    } else {
      // the step CANNOT be replaced, the proposed step is invalid
      console.log('step CANNOT be replaced');
      addAlert &&
        addAlert({
          title: 'Replace Step Unsuccessful',
          variant: AlertVariant.danger,
          description: validation.message ?? 'Something went wrong, please try again later.',
        });
    }
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

    // if there are no steps or if the first step has a `type`,
    // but it isn't a source,
    // create a dummy placeholder step
    if (steps.length === 0 || (steps.length > 0 && steps[0].type && steps[0].type !== 'START')) {
      // @ts-ignore
      steps.unshift({ name: 'ADD A STEP' });
    }

    steps.map((step, index) => {
      // Grab the previous step to use for determining position and drawing edges
      const previousStep = stepsAsElements[index - 1];
      let stepEdge: IVizStepPropsEdge = { id: '' };

      // Build the default parameters
      let inputStep: IVizStepProps = {
        data: {
          connectorType: step.type,
          icon: step.icon,
          kind: step.kind,
          label: truncateString(step.name, 14),
          UUID: step.UUID,
          index,
          onDropChange,
          onElementClickAdd: onSelectNewStep,
        },
        id: getId(),
        position: { x: 0, y: window.innerHeight / 2 },
        type: 'step',
      };

      // add edge properties if more than one step, and not on first step
      if (steps.length > 1 && index !== 0) {
        stepEdge.arrowHeadType = 'arrowclosed';
        stepEdge.id = 'e' + previousStep.id + '-' + inputStep.id;
        stepEdge.source = previousStep.id;

        // even the last step needs to build the step edge before it, with itself as the target
        stepEdge.target = inputStep.id;
      }

      // determine position of Step, add properties
      switch (index) {
        case 0:
          // first item in `steps` array
          inputStep.position.x = window.innerWidth / 5;
          // mark as a slot if it's first in the array and not a START step
          if (steps.length > 0 && steps[0].type !== 'START') {
            inputStep.type = 'slot';
          }
          inputStep.data.connectorType = 'START';
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

      // only add step edge if there is more than one step and not on the first step
      if (steps.length > 1 && index !== 0) {
        stepEdges.push(stepEdge);
      }

      return;
    });

    // combine steps and step edges before setting hook state
    const combined = stepsAsElements.concat(stepEdges);
    setElements(combined);
  };

  // Delete an integration step
  const deleteStep = () => {
    if (!selectedStep.UUID) return;
    setIsPanelExpanded(false);
    setSelectedStep(placeholderStep);

    const stepsIndex = findStepIdxWithUUID(selectedStep.UUID, viewData.steps);
    dispatch({ type: 'DELETE_STEP', payload: { index: stepsIndex } });
  };

  // Close Step View panel
  const onClosePanelClick = () => {
    setIsPanelExpanded(false);
  };

  /**
   * Called when a catalog step is dragged over the visualization canvas
   * @param event
   */
  const onDragOver = (event: {
    preventDefault: () => void;
    dataTransfer: { dropEffect: string };
  }) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  /**
   * Called when an element is clicked
   * @param _e
   * @param element
   */
  const onElementClick = (_e: any, element: any) => {
    // Only set state again if the ID is not the same
    if (selectedStep.UUID !== element.data.UUID) {
      const findStep: IStepProps =
        viewData.steps.find((step) => step.UUID === element.data.UUID) ?? selectedStep;
      setSelectedStep(findStep);

      setIsPanelExpanded(!isPanelExpanded);
    }
  };

  /**
   * Handles selecting a step from the Mini Catalog (append step)
   * @param selectedStep
   */
  const onSelectNewStep = (selectedStep: IStepProps) => {
    dispatch({ type: 'ADD_STEP', payload: { newStep: selectedStep } });

    // fetch the updated view definitions again with new views
    fetchViewDefinitions(viewData.steps).then((data: any) => {
      dispatch({ type: 'UPDATE_INTEGRATION', payload: data });
    });
  };

  const onElementsRemove = (elementsToRemove: Elements<IVizStepProps[]>) =>
    setElements((els) => removeElements(elementsToRemove, els));

  const onExpandPanel = () => {
    //drawerRef.current && drawerRef.current.focus();
  };

  const onLoad = (_reactFlowInstance: any) => {
    setReactFlowInstance(_reactFlowInstance);
  };

  /**
   * Handles Step View configuration changes
   * @param newValues
   */
  const saveConfig = (newValues: { [s: string]: unknown } | ArrayLike<unknown>) => {
    let newStep: IStepProps = selectedStep;
    const newStepParameters = newStep.parameters;

    if (newStepParameters && newStepParameters.length > 0) {
      Object.entries(newValues).map(([key, value]) => {
        const paramIndex = newStepParameters.findIndex((p) => p.id === key);
        newStepParameters[paramIndex!].value = value;
      });

      const oldStepIdx = findStepIdxWithUUID(selectedStep.UUID!, viewData.steps);
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
                data-testid={'react-flow-wrapper'}
                ref={reactFlowWrapper}
                style={{ width: window.innerWidth, height: window.innerHeight }}
              >
                <ReactFlow
                  elements={elements}
                  nodeTypes={nodeTypes}
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
