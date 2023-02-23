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
import { useIntegrationJsonStore, useNestedStepsStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps, IVizStepNode } from '@kaoto/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, Viewport } from 'reactflow';

const Visualization = () => {
  // `nodes` is an array of UI-specific objects that represent
  // the Integration.Steps model visually, while `edges` connect them

  const defaultViewport: Viewport = {
    // 80/2 means half of the size of the icon so the placeholder icon can be centered
    x: window.innerWidth / 2 - 80 / 2,
    y: (window.innerHeight - 77) / 2 - 80 / 2,
    zoom: 1.2,
  };
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [selectedStep, setSelectedStep] = useState<IStepProps>({
    maxBranches: 0,
    minBranches: 0,
    name: '',
    type: '',
    UUID: '',
  });
  const integrationJsonStore = useIntegrationJsonStore();
  const nestedStepsStore = useNestedStepsStore();
  const visualizationStore = useVisualizationStore();
  const previousLayout = useRef(visualizationStore.layout);
  const previousIntegrationJson = useRef(integrationJsonStore.integrationJson);
  const visualizationService = new VisualizationService(integrationJsonStore, visualizationStore);
  const stepsService = new StepsService(integrationJsonStore, nestedStepsStore, visualizationStore);

  // initial loading of visualization steps
  useEffect(() => {
    visualizationService.redrawDiagram(handleDeleteStep, true).catch((e) => console.error(e));
  }, []);

  /**
   * Check for changes to integrationJson,
   * which causes Visualization nodes to all be redrawn
   */
  useEffect(() => {
    if (previousIntegrationJson.current === integrationJsonStore.integrationJson) return;

    stepsService.updateViews();
    visualizationService.redrawDiagram(handleDeleteStep, true).catch((e) => console.error(e));

    previousIntegrationJson.current = integrationJsonStore.integrationJson;
  }, [integrationJsonStore.integrationJson]);

  useEffect(() => {
    if (previousLayout.current === visualizationStore.layout) return;

    visualizationService.redrawDiagram(handleDeleteStep, false).catch((e) => console.error(e));

    previousLayout.current = visualizationStore.layout;
  }, [visualizationStore.layout]);

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

  const onClosePanelClick = () => {
    setIsPanelExpanded(false);
    visualizationStore.setSelectedStepUuid('');
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
   * @param e
   * @param node
   */
  const onNodeClick = (e: any, node: IVizStepNode) => {
    // here we check if it's a node or edge
    // workaround for https://github.com/wbkd/react-flow/issues/2202
    if (!e.target.classList.contains('stepNode__clickable')) return;
    e.preventDefault();

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
  };

  const onLoad = (_reactFlowInstance: any) => {
    setReactFlowInstance(_reactFlowInstance);
  };

  /**
   * Handles Step View configuration changes
   * @param newValues
   */
  const saveConfig = (newValues: { [s: string]: unknown } | ArrayLike<unknown>) => {
    stepsService.updateStepParameters(selectedStep, newValues);
  };

  return (
    <StepErrorBoundary>
      {/* RIGHT DRAWER: STEP DETAIL & EXTENSIONS */}
      <KaotoDrawer
        isExpanded={isPanelExpanded}
        data-expanded={isPanelExpanded}
        isResizable={true}
        dataTestId={'kaoto-right-drawer'}
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
          ref={reactFlowWrapper}
          style={{
            width: '100vw',
            height: 'calc(100vh - 77px )',
          }}
        >
          <ReactFlow
            nodes={visualizationStore.nodes}
            edges={visualizationStore.edges}
            defaultViewport={defaultViewport}
            edgeTypes={edgeTypes}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onNodesChange={visualizationStore.onNodesChange}
            onEdgesChange={visualizationStore.onEdgesChange}
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
