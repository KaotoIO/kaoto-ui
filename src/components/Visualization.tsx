import { fetchIntegrationJson, fetchViews } from '../api';
import {
  useIntegrationJsonStore,
  useIntegrationSourceStore,
  useSettingsStore,
  useVisualizationStore,
} from '../store';
import { IStepProps, IViewData, IVizStepPropsEdge, IVizStepPropsNode } from '../types';
import { findStepIdxWithUUID, truncateString, usePrevious } from '../utils';
import { KaotoDrawer, PlusButtonEdge, StepErrorBoundary, StepViews, VisualizationStep } from './';
import './Visualization.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  ReactFlowProvider,
} from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';
import 'react-flow-renderer/dist/theme-default.css';

interface IVisualization {
  initialState?: IViewData;
  toggleCatalog?: () => void;
}

let id = 0;
const getId = () => `dndnode_${id++}`;

const Visualization = ({ toggleCatalog }: IVisualization) => {
  // `nodes` is an array of UI-specific objects that represent
  // the Integration.Steps model visually, while `edges` connect them
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [selectedStep, setSelectedStep] = useState<IStepProps>({ name: '', type: '' });
  const sourceCode = useIntegrationSourceStore((state) => state.sourceCode);
  const { deleteStep, integrationJson, replaceStep, setViews, updateIntegration } =
    useIntegrationJsonStore();
  const settings = useSettingsStore((state) => state.settings);
  const { edges, nodes, deleteNode, onEdgesChange, onNodesChange, setEdges, setNodes } =
    useVisualizationStore();

  const previousIntegrationJson = useRef(integrationJson);
  const previousSettings = usePrevious(settings);

  /**
   * Check for changes to integrationJson,
   * which causes Visualization nodes to all be redrawn
   */
  useEffect(() => {
    if (previousIntegrationJson.current === integrationJson) return;

    // FETCH VIEWS
    fetchViews(integrationJson.steps).then((views) => {
      setViews(views);
    });

    prepareAndSetVizDataSteps(integrationJson.steps.slice());

    previousIntegrationJson.current = integrationJson;
  }, [integrationJson]);

  // checks for changes to settings (e.g. dsl, name, namespace)
  useEffect(() => {
    if (settings === previousSettings) return;
    fetchIntegrationJson(sourceCode, settings.dsl)
      .then((newIntegration) => {
        updateIntegration({
          ...newIntegration,
          metadata: { ...settings, ...newIntegration.metadata },
        });
      })
      .catch((err) => {
        console.error(err);
      });

    // update views in case DSL change results in views change
    // i.e. CamelRoute -> KameletBinding results in loss of incompatible steps
    fetchViews(integrationJson.steps).then((newViews) => {
      setViews(newViews);
    });
  }, [settings]);

  const nodeTypes = useMemo(() => ({ step: VisualizationStep }), []);
  const edgeTypes = useMemo(
    () => ({
      insert: PlusButtonEdge,
    }),
    []
  );

  /**
   * Creates an object for the Visualization from the Step model.
   * Contains UI-specific metadata (e.g. position).
   * Data is stored in the `nodes` and `edges` hooks.
   */
  const prepareAndSetVizDataSteps = (steps: IStepProps[]) => {
    const incrementAmt = 160;
    const stepsAsNodes: IVizStepPropsNode[] = [];
    const stepEdges: IVizStepPropsEdge[] = [];
    const firstStepPosition = { x: window.innerWidth / 2 - incrementAmt - 80, y: 250 };

    // if there are no steps or if the first step has a `type`,
    // but it isn't a source, create a dummy placeholder step
    if (steps.length === 0 || (steps.length > 0 && steps[0].type && steps[0].type !== 'START')) {
      stepsAsNodes.unshift({
        data: {
          label: 'ADD A STEP',
          step: {
            name: '',
            type: 'START',
          },
        },
        id: getId(),
        position: firstStepPosition,
        type: 'step',
      });
    }

    const calculatePosition = (stepIdx: number, previousStep?: any) => {
      // check if there is a node with the same index,
      // use its position if there is
      if (nodes[stepIdx]) {
        return { ...nodes[stepIdx].position };
      }
      if (!previousStep) {
        return firstStepPosition;
      } else {
        return { x: previousStep?.position.x + incrementAmt, y: 250 };
      }
    };

    steps.map((step, index) => {
      // Grab the previous step to use for determining position and drawing edges
      let previousStep: any;
      // if missing a START step, accommodate for ADD A STEP placeholder
      if (stepsAsNodes.length > 0 && stepsAsNodes[0].data.label === 'ADD A STEP') {
        previousStep = stepsAsNodes[index];
      } else {
        previousStep = stepsAsNodes[index - 1];
      }

      let stepEdge: IVizStepPropsEdge = {
        data: undefined,
        source: '',
        target: '',
        id: '',
        markerEnd: {
          type: MarkerType.Arrow,
        },
      };

      // Build the default parameters
      let inputStep: IVizStepPropsNode = {
        data: {
          icon: step.icon,
          kind: step.kind,
          label: truncateString(step.name, 14),
          step,
          UUID: step.UUID,
        },
        id: getId(),
        position: calculatePosition(index, previousStep),
        type: 'step',
      };

      // add edge properties if more than one step, and not on first step
      if (previousStep) {
        stepEdge.arrowHeadType = 'arrowclosed';
        // previousStep here is stale when deleting first step
        stepEdge.id = 'e' + previousStep.id + '-' + inputStep.id;
        stepEdge.source = previousStep.id;

        // even the last step needs to build the step edge before it, with itself as the target
        stepEdge.target = inputStep.id;
        stepEdge.type = 'insert';

        // only add step edge if there is more than one step and not on the first step
        stepEdges.push(stepEdge);
      }

      stepsAsNodes.push(inputStep);

      return;
    });

    setEdges(stepEdges);
    setNodes(stepsAsNodes);
  };

  // Delete an integration step
  const handleDeleteStep = () => {
    if (!selectedStep.UUID) return;
    setIsPanelExpanded(false);
    setSelectedStep({ name: '', type: '' });

    // here we pass integrationJson array of steps instead of `nodes`
    // because `deleteStep` requires the index to be from `integrationJson`
    const stepsIndex = findStepIdxWithUUID(selectedStep.UUID, integrationJson.steps);

    deleteNode(stepsIndex);
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

    if (!node.data.UUID) {
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

      const oldStepIdx = findStepIdxWithUUID(selectedStep?.UUID!, integrationJson.steps);

      // Replace step with new step
      replaceStep(newStep, oldStepIdx);
    } else {
      return;
    }
  };

  return (
    <StepErrorBoundary>
      {/* RIGHT DRAWER: STEP DETAIL & EXTENSIONS */}
      <KaotoDrawer
        isExpanded={isPanelExpanded}
        isResizable={true}
        panelContent={
          <StepViews
            step={selectedStep}
            isPanelExpanded={isPanelExpanded}
            deleteStep={handleDeleteStep}
            onClosePanelClick={onClosePanelClick}
            saveConfig={saveConfig}
          />
        }
        position={'right'}
        id={'right-resize-panel'}
        defaultSize={'500px'}
        minSize={'150px'}
      >
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
              edgeTypes={edgeTypes}
              nodeTypes={nodeTypes}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onLoad={onLoad}
              snapToGrid={true}
              snapGrid={[15, 15]}
              deleteKeyCode={null}
            >
              {/*<MiniMap nodeBorderRadius={2} className={'visualization__minimap'} />*/}
              <Controls className={'visualization__controls'} />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </KaotoDrawer>
    </StepErrorBoundary>
  );
};

export { Visualization };
