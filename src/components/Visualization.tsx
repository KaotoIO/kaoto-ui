import './Visualization.css';
import { fetchViews } from '@kaoto/api';
import {
  KaotoDrawer,
  PlusButtonEdge,
  StepErrorBoundary,
  VisualizationControls,
  VisualizationStep,
  VisualizationStepViews,
} from '@kaoto/components';
import {
  buildBranchSpecialEdges,
  buildEdges,
  buildNodesFromSteps,
  findStepIdxWithUUID,
  getLayoutedElements,
  containsAddStepPlaceholder,
} from '@kaoto/services';
import { useIntegrationJsonStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps, IViewData, IVizStepPropsEdge, IVizStepNode } from '@kaoto/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, Viewport } from 'reactflow';

interface IVisualization {
  initialState?: IViewData;
  toggleCatalog?: () => void;
}

const Visualization = ({ toggleCatalog }: IVisualization) => {
  // `nodes` is an array of UI-specific objects that represent
  // the Integration.Steps model visually, while `edges` connect them
  const defaultViewport: Viewport = {
    x: 0,
    y: 0,
    zoom: 1.2,
  };

  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [, setReactFlowInstance] = useState(null);
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const [selectedStep, setSelectedStep] = useState<IStepProps>({
    maxBranches: 0,
    minBranches: 0,
    name: '',
    type: '',
    UUID: '',
  });
  const { deleteStep, integrationJson, replaceStep, setViews } = useIntegrationJsonStore();
  const layout = useVisualizationStore((state) => state.layout);
  const previousIntegrationJson = useRef(integrationJson);
  const previousLayout = useRef(layout);
  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, deleteNode } =
    useVisualizationStore();

  /**
   * Center first node if it is the initial `add a step `
   * node into react flow viewport.
   */
  useEffect(() => {
    const isAddStepPlaceholder = containsAddStepPlaceholder(nodes);

    if (isAddStepPlaceholder) {
      const reactFlowWrapper = reactFlowWrapperRef.current;

      let reactFlowWrapperRect;

      if (reactFlowWrapper) {
        reactFlowWrapperRect = reactFlowWrapper.getBoundingClientRect();
      }

      if (
        nodes[0]?.width &&
        nodes[0]?.height &&
        reactFlowWrapperRect?.width &&
        reactFlowWrapperRect?.height
      ) {
        const firstNodeWidth = nodes[0].width;
        const firstNodeHeight = nodes[0].height;
        const reactFlowWrapperRectWidth = reactFlowWrapperRect.width;
        const reactFlowWrapperRectHeight = reactFlowWrapperRect.height;

        nodes[0].position.x = (reactFlowWrapperRectWidth / 2 - firstNodeWidth / 2) * 0.8;
        nodes[0].position.y = (reactFlowWrapperRectHeight / 2 - firstNodeHeight / 2) * 0.8;
      }
    }
  });

  /**
   * Initial loading of visualization steps
   */
  useEffect(() => {
    const { stepNodes, stepEdges } = buildNodesAndEdges(integrationJson.steps);

    getLayoutedElements(stepNodes, stepEdges, layout)
      .then((res) => {
        const { layoutedNodes, layoutedEdges } = res;
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      })
      .catch((e) => console.error(e));
  }, []);

  /**
   * Check for changes to integrationJson,
   * which causes Visualization nodes to all be redrawn
   */
  useEffect(() => {
    if (previousIntegrationJson.current === integrationJson) return;

    fetchViews(integrationJson.steps).then((views) => {
      setViews(views);
    });

    const { stepNodes, stepEdges } = buildNodesAndEdges(integrationJson.steps);
    getLayoutedElements(stepNodes, stepEdges, layout)
      .then((res) => {
        const { layoutedNodes, layoutedEdges } = res;
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      })
      .catch((e) => console.error(e));

    previousIntegrationJson.current = integrationJson;
  }, [integrationJson]);

  useEffect(() => {
    if (previousLayout.current === layout) return;

    getLayoutedElements(nodes, edges, layout)
      .then((res) => {
        const { layoutedNodes, layoutedEdges } = res;
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      })
      .catch((e) => console.error(e));

    previousLayout.current = layout;
  }, [layout]);

  const nodeTypes = useMemo(() => ({ step: VisualizationStep }), []);
  const edgeTypes = useMemo(
    () => ({
      insert: PlusButtonEdge,
    }),
    []
  );

  function buildNodesAndEdges(steps: IStepProps[]) {
    const stepNodes = buildNodesFromSteps(steps, layout, {
      handleDeleteStep,
    });

    const filteredNodes = stepNodes.filter((node) => !node.data.branchInfo?.branchStep);
    let stepEdges: IVizStepPropsEdge[] = buildEdges(filteredNodes);

    const branchSpecialEdges: IVizStepPropsEdge[] = buildBranchSpecialEdges(stepNodes);

    stepEdges = stepEdges.concat(...branchSpecialEdges);

    return { stepNodes, stepEdges };
  }

  const handleDeleteStep = (UUID?: string) => {
    if (!UUID) return;

    setSelectedStep({ maxBranches: 0, minBranches: 0, name: '', type: '', UUID: '' });
    if (isPanelExpanded) setIsPanelExpanded(false);

    // `deleteStep` requires the index to be from `integrationJson`, not `nodes`
    const stepsIndex = findStepIdxWithUUID(UUID, integrationJson.steps);

    deleteNode(stepsIndex);
    deleteStep(stepsIndex);
  };

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
  const onNodeClick = (_e: any, node: IVizStepNode) => {
    // here we check if it's a node or edge
    // workaround for https://github.com/wbkd/react-flow/issues/2202
    if (!_e.target.classList.contains('stepNode__clickable')) return;

    if (!node.data.step.UUID) {
      // prevent slots from being selected, passive-aggressively open the steps catalog
      if (toggleCatalog) toggleCatalog();
      return;
    }

    // Only set state again if the ID is not the same
    const findStep: IStepProps =
      integrationJson.steps.find((step) => step.UUID === node.data.step.UUID) ?? selectedStep;
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
          <VisualizationStepViews
            step={selectedStep}
            isPanelExpanded={isPanelExpanded}
            onClosePanelClick={onClosePanelClick}
            saveConfig={saveConfig}
          />
        }
        position={'right'}
        id={'right-resize-panel'}
        defaultSize={'500px'}
        minSize={'150px'}
      >
        <div
          className="reactflow-wrapper"
          data-testid={'react-flow-wrapper'}
          ref={reactFlowWrapperRef}
          style={{
            width: window.innerWidth,
            height: window.innerHeight - 153,
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            edgeTypes={edgeTypes}
            defaultViewport={defaultViewport}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onLoad={onLoad}
            snapToGrid={true}
            snapGrid={[15, 15]}
            deleteKeyCode={null}
            zoomOnDoubleClick={false}
          >
            {/*<MiniMap nodeBorderRadius={2} className={'visualization__minimap'} />*/}
            <VisualizationControls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </KaotoDrawer>
    </StepErrorBoundary>
  );
};

export { Visualization };
