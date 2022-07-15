import {
  fetchIntegrationSourceCode,
  fetchViews,
  fetchIntegrationJson,
  useIntegrationJsonStore,
  useSettingsStore,
  useSourceCodeStore,
} from '../api';
import {
  IStepProps,
  IViewData,
  IVizStepNodeData,
  IVizStepPropsNode,
  IVizStepPropsEdge,
  IViewProps,
} from '../types';
import { findStepIdxWithUUID, truncateString, usePrevious } from '../utils';
import '../utils';
import { canStepBeReplaced } from '../utils/validationService';
import { StepErrorBoundary, StepViews, VisualizationSlot, VisualizationStep } from './';
import './Visualization.css';
import useStore from './Visualization.store';
import { AlertVariant, Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';
import 'react-flow-renderer/dist/theme-default.css';

interface IVisualization {
  handleUpdateViews: (newViews: IViewProps[]) => void;
  initialState?: IViewData;
  toggleCatalog?: () => void;
  views: IViewProps[];
}

let id = 0;
const getId = () => `dndnode_${id++}`;

const Visualization = ({ handleUpdateViews, toggleCatalog, views }: IVisualization) => {
  // `nodes` is an array of UI-specific objects that represent
  // the Integration.Steps model visually, while `edges` connect them
  // const [nodes, setNodes] = useState<Node<IStepProps>[]>([]);
  // const [edges, setEdges] = useState<Edge[]>([]);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [selectedStep, setSelectedStep] = useState<IStepProps>({ name: '', type: '' });
  const { sourceCode, setSourceCode } = useSourceCodeStore();
  const { integrationJson, addStep, deleteStep, replaceStep, updateIntegration } =
    useIntegrationJsonStore((state) => state);
  const previousIntegrationJson = usePrevious(integrationJson);
  const shouldUpdateCodeEditor = useRef(true);
  const { settings } = useSettingsStore((state) => state);
  const previousSettings = usePrevious(settings);
  const { nodes, edges, onNodesChange, onEdgesChange } = useStore();

  const { addAlert } = useAlert() || {};

  /**
   * Check for changes to integrationJson,
   * which causes Visualization nodes to all be redrawn
   */
  useEffect(() => {
    console.log('integration json changed..');

    if (previousIntegrationJson === integrationJson) return;

    console.log('not the same, keep going..');

    // UPDATE SOURCE CODE EDITOR
    if (shouldUpdateCodeEditor.current) {
      updateCodeEditor(integrationJson.steps);
      shouldUpdateCodeEditor.current = false;
    }

    // FETCH VIEWS
    fetchViews(integrationJson.steps).then((views) => {
      handleUpdateViews(views);
    });

    // PREPARE VISUALIZATION DATA
    prepareAndSetVizDataSteps(integrationJson.steps);
  }, [integrationJson]);

  // checks for changes to settings (e.g. dsl, name, namespace)
  useEffect(() => {
    if (settings === previousSettings) return;
    fetchIntegrationJson(sourceCode, settings.dsl)
      .then((newIntegration) => {
        let tmpInt = newIntegration;
        tmpInt.metadata = { ...newIntegration.metadata, ...settings };
        updateIntegration(tmpInt);
      })
      .catch((err) => {
        console.error(err);
      });

    // update views in case DSL change results in views change
    // i.e. CamelRoute -> KameletBinding results in loss of incompatible steps
    fetchViews(integrationJson.steps).then((newViews) => {
      handleUpdateViews(newViews);
    });
  }, [settings]);

  const updateCodeEditor = (integrationJsonSteps: IStepProps[]) => {
    // Remove all "Add Step" placeholders before updating the API
    const filteredSteps = integrationJsonSteps.filter((step) => step.type);
    let tempInt = integrationJson;
    tempInt.steps = filteredSteps;
    tempInt.metadata = { ...integrationJson.metadata, ...settings };

    fetchIntegrationSourceCode(tempInt)
      .then((value) => {
        if (typeof value === 'string') {
          setSourceCode(value);
        } else {
          setSourceCode('');
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
    const validation = canStepBeReplaced(data, step, integrationJson.steps);

    // Replace step
    if (validation.isValid) {
      // update the steps, the new node will be created automatically
      replaceStep(step, data.index);
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
    console.log('preparing viz steps...');

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
        color: '#4FD1C5',
        connectorType: step.type,
        dsl: settings.dsl,
        handleUpdateViews: handleUpdateViews,
        icon: step.icon,
        index: index,
        kind: step.kind,
        label: truncateString(step.name, 14),
        onDropChange: onDropChange,
        onMiniCatalogClickAdd: onSelectNewStep,
        UUID: step.UUID,
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
          inputStep.position.x = window.innerWidth / 2 - incrementAmt - 80;
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

    onEdgesChange(stepEdges);
    onNodesChange(stepsAsNodes);
  };

  // Delete an integration step
  const handleDeleteStep = () => {
    if (!selectedStep.UUID) return;
    setIsPanelExpanded(false);
    setSelectedStep({ name: '', type: '' });

    const stepsIndex = findStepIdxWithUUID(selectedStep.UUID, integrationJson.steps);
    // need to rely on useEffect to get up-to-date value
    shouldUpdateCodeEditor.current = true;
    deleteStep(stepsIndex);
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
    const findStep: IStepProps =
      integrationJson.steps.find((step) => step.UUID === node.data.UUID) ?? selectedStep;
    setSelectedStep(findStep);

    // show/hide the panel regardless
    if (!isPanelExpanded) setIsPanelExpanded(true);
  };

  /**
   * Handles selecting a step from the Mini Catalog (append step)
   * @param selectedStep
   */
  const onSelectNewStep = (selectedStep: IStepProps) => {
    addStep(selectedStep);
    shouldUpdateCodeEditor.current = true;
  };

  // const onNodesChange = (changes: NodeChange[]) => setNodes((ns) => applyNodeChanges(changes, ns));
  // const onEdgesChange = (changes: EdgeChange[]) => setEdges((es) => applyEdgeChanges(changes, es));

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

      const oldStepIdx = findStepIdxWithUUID(selectedStep.UUID!, integrationJson.steps);
      // we'll need to update the code editor
      shouldUpdateCodeEditor.current = true;

      // Replace step with new step
      replaceStep(newStep, oldStepIdx);
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
              deleteStep={handleDeleteStep}
              onClosePanelClick={onClosePanelClick}
              saveConfig={saveConfig}
              views={views?.filter((view) => view.step === selectedStep.UUID)}
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
                style={{
                  width: window.innerWidth,
                  height: window.innerHeight - 153,
                }}
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
