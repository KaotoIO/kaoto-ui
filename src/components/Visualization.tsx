import './Visualization.css';
import {
  DeleteButtonEdge,
  KaotoDrawer,
  PlusButtonEdge,
  StepErrorBoundary,
  VisualizationControls,
  VisualizationStep,
  VisualizationStepViews,
} from '@kaoto/components';
import { StepsService, VisualizationService } from '@kaoto/services';
import { useIntegrationJsonStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps, IVizStepNode } from '@kaoto/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, Viewport } from 'reactflow';

const Visualization = () => {
  // `nodes` is an array of UI-specific objects that represent
  // the Integration.Steps model visually, while `edges` connect them

  const defaultViewport = useRef<Viewport>({
    // 80/2 means half of the size of the icon so the placeholder icon can be centered
    x: window.innerWidth / 2 - 80 / 2,
    y: (window.innerHeight - 77) / 2 - 80 / 2,
    zoom: 1.2,
  });
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [selectedStep, setSelectedStep] = useState<IStepProps>({
    maxBranches: 0,
    minBranches: 0,
    name: '',
    type: '',
    UUID: '',
  });
  const visualizationStore = useVisualizationStore.getState();
  const layout = useVisualizationStore((state) => state.layout);
  const nodes = useVisualizationStore((state) => state.nodes);
  const edges = useVisualizationStore((state) => state.edges);
  const integrationJson = useIntegrationJsonStore((state) => state.integrationJson);
  const visualizationService = useMemo(() => new VisualizationService(), []);
  const stepsService = useMemo(() => new StepsService(), []);

  /**
   * Check for changes to integrationJson,
   * which causes Visualization nodes to all be redrawn
   */
  useEffect(() => {
    stepsService.updateViews();
  }, [integrationJson]);

  useEffect(() => {
    visualizationService.redrawDiagram(handleDeleteStep, true).catch((e) => console.error(e));
  }, [integrationJson, layout]);

  const nodeTypes = useMemo(() => ({ step: VisualizationStep }), []);
  const edgeTypes = useMemo(
    () => ({
      delete: DeleteButtonEdge,
      insert: PlusButtonEdge,
    }),
    []
  );

  const handleDeleteStep = (UUID?: string) => {
    if (!UUID) return;

    setSelectedStep({ maxBranches: 0, minBranches: 0, name: '', type: '', UUID: '' });
    visualizationStore.setSelectedStepUuid('');
    if (isPanelExpanded) setIsPanelExpanded(false);

    stepsService.deleteStep(UUID);
  };

  const onClosePanelClick = useCallback(() => {
    setIsPanelExpanded(false);
    visualizationStore.setSelectedStepUuid('');
  }, []);

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
   * @param e
   * @param node
   */
  const onNodeClick = useCallback((e: any, node: IVizStepNode) => {
    // here we check if it's a node or edge
    // workaround for https://github.com/wbkd/react-flow/issues/2202
    if (!e.target.classList.contains('stepNode__clickable')) return;

    if (!node.data.isPlaceholder) {
      const step = stepsService.findStepWithUUID(node.data.step.UUID);
      if (step) {
        setSelectedStep(step);
        visualizationStore.setSelectedStepUuid(step.UUID);
      }

      /** If the details panel is collapsed, we expanded for the user */
      if (!isPanelExpanded) setIsPanelExpanded(true);

      /**
       * If the details panel is already expanded and the step it's already
       * selected, we collapse it for the user */
      if (isPanelExpanded && selectedStep.UUID === node.data.step.UUID) {
        setIsPanelExpanded(false);
        visualizationStore.setSelectedStepUuid('');
      }
    }
  }, [isPanelExpanded, selectedStep.UUID, stepsService, visualizationStore]);

  /**
   * Handles Step View configuration changes
   * @param newValues
   */
  const saveConfig = useCallback((newValues: { [s: string]: unknown } | ArrayLike<unknown>) => {
    stepsService.updateStepParameters(selectedStep, newValues);
  }, [selectedStep, stepsService]);

  return (
    <StepErrorBoundary>
      {/* RIGHT DRAWER: STEP DETAIL & EXTENSIONS */}
      <KaotoDrawer
        isExpanded={isPanelExpanded}
        data-expanded={isPanelExpanded}
        isResizable
        dataTestId="kaoto-right-drawer"
        panelContent={
          <VisualizationStepViews
            step={selectedStep}
            isPanelExpanded={isPanelExpanded}
            onClosePanelClick={onClosePanelClick}
            saveConfig={saveConfig}
          />
        }
        position="right"
        id="right-resize-panel"
        defaultSize="500px"
        minSize="150px"
      >
        <div
          className="reactflow-wrapper"
          data-testid="react-flow-wrapper"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            defaultViewport={defaultViewport.current}
            edgeTypes={edgeTypes}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onNodesChange={visualizationStore.onNodesChange}
            onEdgesChange={visualizationStore.onEdgesChange}
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
