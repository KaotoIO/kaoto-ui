import './Visualization.css';
import { fetchViews } from '@kaoto/api';
import {
  KaotoDrawer,
  PlusButtonEdge,
  StepErrorBoundary,
  VisualizationStep,
  VisualizationStepViews,
} from '@kaoto/components';
import {
  buildBranch,
  buildBranchSpecialEdges,
  buildEdges,
  buildNodesFromSteps,
  findStepIdxWithUUID,
} from '@kaoto/services';
import { useIntegrationJsonStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps, IViewData, IVizStepPropsEdge, IVizStepNode } from '@kaoto/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, Viewport } from 'reactflow';

interface IVisualization {
  initialState?: IViewData;
  toggleCatalog?: () => void;
}

const Visualization = ({ toggleCatalog }: IVisualization) => {
  // `nodes` is an array of UI-specific objects that represent
  // the Integration.Steps model visually, while `edges` connect them
  const defaultViewport: Viewport = { x: 10, y: 15, zoom: 1.2 };
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [selectedStep, setSelectedStep] = useState<IStepProps>({
    name: '',
    type: '',
    maxBranches: 0,
    minBranches: 0,
  });
  const { deleteStep, integrationJson, replaceStep, setViews } = useIntegrationJsonStore();
  const { edges, nodes, deleteNode, onEdgesChange, onNodesChange, setEdges, setNodes } =
    useVisualizationStore();

  const previousIntegrationJson = useRef(integrationJson);

  // initial loading of visualization steps
  useEffect(() => {
    const { combinedNodes, combinedEdges } = buildNodesAndEdges(integrationJson.steps);
    setEdges(combinedEdges);
    setNodes(combinedNodes);
  }, []);

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

    const { combinedNodes, combinedEdges } = buildNodesAndEdges(integrationJson.steps);
    setEdges(combinedEdges);
    setNodes(combinedNodes);

    previousIntegrationJson.current = integrationJson;
  }, [integrationJson]);

  const nodeTypes = useMemo(() => ({ step: VisualizationStep }), []);
  const edgeTypes = useMemo(
    () => ({
      insert: PlusButtonEdge,
    }),
    []
  );

  function buildNodesAndEdges(steps: IStepProps[]) {
    const combinedEdges: IVizStepPropsEdge[] = [];
    const combinedNodes: IVizStepNode[] = [];

    const { stepNodes, branchOriginStepNodes } = buildNodesFromSteps(steps, nodes);
    const { branchNodes, branchStepEdges } = buildBranch(branchOriginStepNodes);
    const stepEdges: IVizStepPropsEdge[] = buildEdges(stepNodes);
    const branchSpecialEdges: IVizStepPropsEdge[] = buildBranchSpecialEdges(branchNodes, stepNodes);

    combinedNodes.push(...stepNodes, ...branchNodes);
    combinedEdges.push(...stepEdges, ...branchStepEdges);
    combinedEdges.push(...branchSpecialEdges);

    return { combinedNodes, combinedEdges };
  }

  const handleDeleteStep = () => {
    if (!selectedStep.UUID) return;
    setIsPanelExpanded(false);
    setSelectedStep({ maxBranches: 0, minBranches: 0, name: '', type: '' });

    // `deleteStep` requires the index to be from `integrationJson`, not `nodes`
    const stepsIndex = findStepIdxWithUUID(selectedStep.UUID, integrationJson.steps);

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

    if (!node.data.UUID) {
      // prevent slots from being selected, passive-aggressively open the steps catalog
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
              defaultViewport={defaultViewport}
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
