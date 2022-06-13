import {
  fetchCustomResource,
  fetchViewDefinitions,
  useStepsAndViewsContext,
  useYAMLContext,
} from '../api';
import {
  ISettings,
  IStepProps,
  IViewData,
  IVizStepNodeData,
  IVizStepPropsNode,
  IVizStepPropsEdge,
} from '../types';
import { findStepIdxWithUUID, truncateString, usePrevious } from '../utils';
import '../utils';
import { canStepBeReplaced } from '../utils/validationService';
import { StepErrorBoundary, StepViews, VisualizationSlot, VisualizationStep } from './';
import './Visualization.css';
import { AlertVariant, Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  Node,
  NodeChange,
  ReactFlowProvider,
} from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';
import 'react-flow-renderer/dist/theme-default.css';

let id = 0;
const getId = () => `dndnode_${id++}`;

interface IVisualization {
  initialState?: IViewData;
  settings: ISettings;
  toggleCatalog?: () => void;
}

const Visualization = ({ settings, toggleCatalog }: IVisualization) => {
  // `nodes` is an array of UI-specific objects that represent
  // the Step model visually, while `edges` connect them
  const [nodes, setNodes] = useState<Node<IStepProps>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [selectedStep, setSelectedStep] = useState<IStepProps>({ name: '', type: '' });
  const [, setYAMLData] = useYAMLContext();
  const [viewData, dispatch] = useStepsAndViewsContext();
  const previousViewData = usePrevious(viewData);
  const shouldUpdateCodeEditor = useRef(false);

  const { addAlert } = useAlert() || {};

  useEffect(() => {
    if (previousViewData === viewData) {
      return;
    }

    if (shouldUpdateCodeEditor.current) {
      updateCodeEditor(viewData.steps);
      shouldUpdateCodeEditor.current = false;
    }

    prepareAndSetVizDataSteps(viewData.steps);
  }, [viewData]);

  const updateCodeEditor = (viewDataSteps: IStepProps[]) => {
    // Remove all "Add Step" placeholders before updating the API
    fetchCustomResource(
      viewDataSteps.filter((step) => step.type),
      settings.integrationName
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
            description: 'There was a problem updating the integration. Please try again later.',
          });
      });
  };

  const nodeTypes = useMemo(() => ({ slot: VisualizationSlot, step: VisualizationStep }), []);

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
      fetchViewDefinitions(viewData.steps).then((data: IViewData) => {
        dispatch({ type: 'UPDATE_INTEGRATION', payload: data });
        updateCodeEditor(data.steps);
      });
    } else {
      // the step CANNOT be replaced, the proposed step is invalid
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
    const stepsAsNodes: any[] = [];
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
      const previousStep = stepsAsNodes[index - 1];
      let stepEdge: IVizStepPropsEdge = { id: '' };

      const vizStepData: IVizStepNodeData = {
        connectorType: step.type,
        icon: step.icon,
        kind: step.kind,
        label: truncateString(step.name, 14),
        UUID: step.UUID,
        index,
        onDropChange,
        onMiniCatalogClickAdd: onSelectNewStep,
        settings,
      };

      // Build the default parameters
      let inputStep: IVizStepPropsNode = {
        data: vizStepData,
        id: getId(),
        position: { x: 0, y: 250 },
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
          inputStep.position.x = 250;
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

      stepsAsNodes.push(inputStep);

      // only add step edge if there is more than one step and not on the first step
      if (steps.length > 1 && index !== 0) {
        stepEdges.push(stepEdge);
      }

      return;
    });

    setEdges(stepEdges);
    setNodes(stepsAsNodes);
  };

  // Delete an integration step
  const deleteStep = () => {
    if (!selectedStep.UUID) return;
    setIsPanelExpanded(false);
    setSelectedStep({ name: '', type: '' });

    const stepsIndex = findStepIdxWithUUID(selectedStep.UUID, viewData.steps);
    // need to rely on useEffect to get up-to-date value
    shouldUpdateCodeEditor.current = true;
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
   * Called when a React Flow node is clicked
   * @param _e
   * @param node
   */
  const onNodeClick = (_e: any, node: any) => {
    // here we check if it's a node or edge
    // workaround for https://github.com/wbkd/react-flow/issues/2202
    if (!_e.target.classList.contains('stepNode__clickable')) return;
    if (node.type === 'slot') {
      // prevent slots from being selected,
      // passive-aggressively open the steps catalog
      if (toggleCatalog) toggleCatalog();
      return;
    }

    // Only set state again if the ID is not the same
    if (selectedStep.UUID !== node.data.UUID) {
      const findStep: IStepProps =
        viewData.steps.find((step) => step.UUID === node.data.UUID) ?? selectedStep;
      setSelectedStep(findStep);
    }

    // show/hide the panel regardless
    setIsPanelExpanded(!isPanelExpanded);
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
      updateCodeEditor(data.steps);
    });
  };

  const onNodesChange = (changes: NodeChange[]) => setNodes((ns) => applyNodeChanges(changes, ns));

  const onEdgesChange = (changes: EdgeChange[]) => setEdges((es) => applyEdgeChanges(changes, es));

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
      // we'll need to update the code editor
      shouldUpdateCodeEditor.current = true;

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
                  nodes={nodes}
                  edges={edges}
                  defaultZoom={1.2}
                  nodeTypes={nodeTypes}
                  onDragOver={onDragOver}
                  onNodeClick={onNodeClick}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onLoad={onLoad}
                  snapToGrid={true}
                  snapGrid={[15, 15]}
                >
                  <MiniMap nodeBorderRadius={2} />
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
