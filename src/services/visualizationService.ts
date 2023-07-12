import { FlowsStoreFacade } from '../store/FlowsStoreFacade';
import { useVisualizationStore } from '../store/visualizationStore';
import { StepsService } from './stepsService';
import { ValidationService } from './validationService';
import {
  HandleDeleteStepFn,
  IStepProps,
  IVisibleFlows,
  IVizStepNode,
  IVizStepNodeData,
  IVizStepNodeDataBranch,
  IVizStepPropsEdge,
} from '@kaoto/types';
import { getRandomArbitraryNumber, truncateString } from '@kaoto/utils';
// @ts-ignore
import dagre from 'dagre';
import { MarkerType, Position } from 'reactflow';

/**
 * A collection of business logic to process visualization related tasks.
 * Since Kaoto UI uses React Flow for drawing the diagram in the canvas, the main job to achieve
 * it is to manage React Flow "nodes" and "edges".
 * We use ELK to layout steps in the canvas. See {@link getLayoutedElements} for details.
 * This class focuses on visualization. For handling internal Step model objects, see {@link StepsService}.
 * Note: Methods are declared in alphabetical order.
 *  @see IVizStepNode
 *  @see IVizStepPropsEdge
 *  @see StepsService
 */
export class VisualizationService {
  /**
   * for nodes within a branch
   * @param step
   * @param nodeId
   * @param layout
   * @param dataProps
   */
  static buildBranchNodeParams(
    step: IStepProps,
    nodeId: string,
    layout: string,
    dataProps?: { [prop: string]: any },
  ): IVizStepNode {
    return {
      data: {
        kind: step.kind,
        label: truncateString(step.name, 14),
        step,
        icon: step.icon,
        ...dataProps,
      },
      id: nodeId,
      position: { x: 0, y: 0 },
      draggable: false,
      sourcePosition: layout === 'RIGHT' ? Position.Top : Position.Right,
      targetPosition: layout === 'RIGHT' ? Position.Bottom : Position.Left,
      type: 'step',
    } as IVizStepNode;
  }

  /**
   * Builds edges for branches with only a single step
   * i.e. for placeholders within a branch
   * @param node
   * @param rootNode
   * @param rootNextNode
   * @param edgeType
   */
  static buildBranchSingleStepEdges(
    node: IVizStepNode,
    rootNode: IVizStepNode,
    rootNextNode: IVizStepNode,
    edgeType?: string,
  ): IVizStepPropsEdge[] {
    const branchPlaceholderEdges: IVizStepPropsEdge[] = [];
    let edgeProps = VisualizationService.buildEdgeParams(rootNode, node, edgeType ?? 'default');

    if (node.data.branchInfo?.branchIdentifier)
      edgeProps.label = node.data.branchInfo.branchIdentifier;

    branchPlaceholderEdges.push(edgeProps);

    if (rootNextNode) {
      branchPlaceholderEdges.push(
        VisualizationService.buildEdgeParams(node, rootNextNode, 'default'),
      );
    }

    return branchPlaceholderEdges;
  }

  /**
   * Builds branch step edges and edges that need to connect branches to prev/next steps
   * @param stepNodes
   */
  buildBranchSpecialEdges(stepNodes: IVizStepNode[]): IVizStepPropsEdge[] {
    const specialEdges: IVizStepPropsEdge[] = [];

    stepNodes.forEach((node) => {
      if (node.type === 'group') return;

      const parentNodeIndex = VisualizationService.findNodeIdxWithUUID(
        node.data.branchInfo?.parentStepUuid,
        stepNodes,
      );

      if (node.data.branchInfo) {
        // handle all "normal" steps within a branch
        if (
          node.data.branchInfo.branchStep &&
          !node.data.isLastStep &&
          !node.data.isPlaceholder &&
          !StepsService.containsBranches(node.data.step)
        ) {
          const branchStepNextIdx = VisualizationService.findNodeIdxWithUUID(
            node.data.nextStepUuid,
            stepNodes,
          );
          if (stepNodes[branchStepNextIdx]) {
            specialEdges.push(
              VisualizationService.buildEdgeParams(node, stepNodes[branchStepNextIdx], 'insert'),
            );
          }
        }

        // handle special first step, needs to be connected to its immediate parent
        if (node.data.isFirstStep) {
          const parentStepNode: IVizStepNode = stepNodes[parentNodeIndex];
          const showDeleteEdge = ValidationService.reachedMinBranches(
            parentStepNode.data.step.branches.length,
            parentStepNode.data.step.minBranches,
          );
          let edgeProps = VisualizationService.buildEdgeParams(
            parentStepNode,
            node,
            showDeleteEdge ? 'delete' : 'default',
          );

          if (node.data.branchInfo?.branchIdentifier)
            edgeProps.label = node.data.branchInfo?.branchIdentifier;

          specialEdges.push(edgeProps);
        }

        // handle placeholder steps within a branch
        if (node.data.branchInfo?.branchStep && node.data.isPlaceholder) {
          const parentStepNode: IVizStepNode = stepNodes[parentNodeIndex];
          const parentStepNextIdx = VisualizationService.findNodeIdxWithUUID(
            node.data.branchInfo?.parentStepNextUuid,
            stepNodes,
          );
          const showDeleteEdge = ValidationService.reachedMinBranches(
            parentStepNode.data.step.branches.length,
            parentStepNode.data.step.minBranches,
          );

          specialEdges.push(
            ...VisualizationService.buildBranchSingleStepEdges(
              node,
              stepNodes[parentNodeIndex],
              stepNodes[parentStepNextIdx],
              showDeleteEdge ? 'delete' : 'default',
            ),
          );
        }

        // handle special last steps
        if (node.data.isLastStep && !StepsService.isEndStep(node.data.step)) {
          const parentStepNextIdx = VisualizationService.findNodeIdxWithUUID(
            node.data.branchInfo?.parentStepNextUuid,
            stepNodes,
          );

          if (stepNodes[parentStepNextIdx]) {
            // it needs to merge back
            specialEdges.push(
              VisualizationService.buildEdgeParams(node, stepNodes[parentStepNextIdx], 'default'),
            );
          }
        }
      }
    });

    return specialEdges;
  }

  /**
   * @param sourceStep
   * @param targetStep
   * @param type
   */
  static buildEdgeParams(
    sourceStep: IVizStepNode,
    targetStep: IVizStepNode,
    type?: string,
  ): IVizStepPropsEdge {
    return {
      arrowHeadType: 'arrowclosed',
      id: `e-${sourceStep.id}>${targetStep.id}`,
      data: {
        showBranchesTab: this.showBranchesTab(targetStep.data.step),
        showStepsTab: this.showStepsTab(sourceStep.data),
        sourceStepNode: sourceStep,
        targetStepNode: targetStep,
      },
      markerEnd: {
        type: MarkerType.Arrow,
        color: '#d2d2d2',
        strokeWidth: 2,
      },
      style: {
        stroke: '#d2d2d2',
        strokeWidth: 2,
      },
      source: sourceStep.id,
      target: targetStep.id,
      type: type ?? 'default',
    };
  }

  static buildEdges(nodes: IVizStepNode[]): IVizStepPropsEdge[] {
    const stepEdges: IVizStepPropsEdge[] = [];

    // for every node except for placeholders and the last step, add an edge
    if (nodes.length === 1) {
      return stepEdges;
    }

    nodes.forEach((node) => {
      const nextNodeIdx = VisualizationService.findNodeIdxWithUUID(node.data.nextStepUuid, nodes);

      if (VisualizationService.shouldAddEdge(node, nodes[nextNodeIdx])) {
        stepEdges.push(
          VisualizationService.buildEdgeParams(
            node,
            nodes[nextNodeIdx],
            node.data.branchInfo || node.data.step.branches?.length > 0 ? 'default' : 'insert',
          ),
        );
      }
    });

    return stepEdges;
  }

  static buildNodeDefaultParams(
    step: IStepProps,
    newId: string,
    props?: { [prop: string]: any },
    branchInfo?: IVizStepNodeDataBranch,
  ): IVizStepNode {
    return {
      data: {
        branchInfo,
        icon: step.icon,
        kind: step.kind,
        label: truncateString(step.name, 14),
        step,
        isPlaceholder: false,
        ...props,
      },
      draggable: false,
      id: newId,
      position: { x: 0, y: 0 },
      type: 'step',
      width: 80,
      height: 80,
      ...props,
    } as IVizStepNode;
  }

  /**
   * Builds React Flow nodes and edges from current integration JSON.
   * @param handleDeleteStep
   */
  private buildNodesAndEdges(handleDeleteStep: HandleDeleteStepFn) {
    const { layout, visibleFlows } = useVisualizationStore.getState();

    // build all nodes
    let stepNodes: IVizStepNode[] = [];

    const flows = FlowsStoreFacade.getFlows();
    stepNodes = flows.reduce((acc, flow) => {
      if (!visibleFlows[flow.id]) {
        return acc;
      }

      return acc.concat(
        VisualizationService.buildNodesFromSteps(flow.id, flow.steps, layout, { handleDeleteStep }),
      );
    }, [] as IVizStepNode[]);

    // build edges only for main nodes
    const filteredNodes = stepNodes.filter((node) => !node.data.branchInfo);
    let stepEdges: IVizStepPropsEdge[] = VisualizationService.buildEdges(filteredNodes);

    // build edges for branch nodes
    const branchSpecialEdges: IVizStepPropsEdge[] = this.buildBranchSpecialEdges(stepNodes);

    stepEdges = stepEdges.concat(...branchSpecialEdges);

    return { stepNodes, stepEdges };
  }

  /**
   * Creates an array for the Visualization from the Step model.
   * Contains UI-specific metadata (e.g. position).
   * Data is stored in the `nodes` hook.
   */
  static buildNodesFromSteps(
    integrationId: string,
    steps: IStepProps[],
    layout: string,
    props?: { [prop: string]: any },
    branchInfo?: IVizStepNodeDataBranch,
  ): IVizStepNode[] {
    let stepNodes: IVizStepNode[] = [];
    let id = 0;
    let getId = (UUID: string) => `node_${id++}-${UUID}-${getRandomArbitraryNumber()}`;

    // if no steps or first step isn't START, create a dummy placeholder step
    if (
      (steps.length === 0 && !branchInfo) ||
      (!StepsService.isFirstStepStart(steps) && !branchInfo)
    ) {
      VisualizationService.insertAddStepPlaceholder(integrationId, stepNodes, getId(''), 'START', {
        nextStepUuid: steps[0]?.UUID,
      });
    }

    // build EIP placeholder
    if (branchInfo && steps.length === 0 && !StepsService.isFirstStepStart(steps)) {
      VisualizationService.insertAddStepPlaceholder(integrationId, stepNodes, getId(''), 'MIDDLE', {
        branchInfo,
        nextStepUuid: steps[0]?.UUID,
      });
    }

    steps.forEach((step, index) => {
      let currentStep: IVizStepNode;

      // build the default parameters for a node
      if (branchInfo) {
        // we are within a branch
        currentStep = VisualizationService.buildBranchNodeParams(step, getId(step.UUID), layout, {
          branchInfo,
          isFirstStep: index === 0,
          isLastStep: index === steps.length - 1 && !step.branches?.length,
          nextStepUuid: steps[index + 1]?.UUID,
          previousStepUuid: steps[index - 1]?.UUID,
          ...props,
        });
        stepNodes.push(currentStep);
      } else {
        currentStep = VisualizationService.buildNodeDefaultParams(step, getId(step.UUID), {
          isLastStep: index === steps.length - 1,
          nextStepUuid: steps[index + 1]?.UUID,
          previousStepUuid: steps[index - 1]?.UUID,
          ...props,
        });
        stepNodes.push(currentStep);
      }

      // recursively build nodes for branch steps
      if (step.branches && step.branches.length > 0 && step.maxBranches !== 0) {
        step.branches.forEach((branch) => {
          stepNodes = stepNodes.concat(
            VisualizationService.buildNodesFromSteps(integrationId, branch.steps, layout, props, {
              branchIdentifier: branch.condition !== null ? branch.condition : branch.identifier,

              // rootStepUuid is the parent for a first branch step,
              // and ancestor for n branch step
              rootStepNextUuid: branchInfo?.rootStepNextUuid ?? steps[index + 1]?.UUID,
              rootStepUuid: branchInfo?.rootStepUuid ?? steps[index].UUID,
              branchStep: true,
              branchUuid: branch.branchUuid,

              // parentStepUuid is always the parent of the branch step, no matter how nested
              parentStepNextUuid: steps[index + 1]?.UUID ?? branchInfo?.rootStepNextUuid,
              parentStepUuid: steps[index].UUID,
            }),
          );
        });
      }
    });

    return stepNodes;
  }

  /**
   * Checks if an array of nodes contains an ADD A STEP placeholder step
   * @param stepNodes
   */
  static containsAddStepPlaceholder(stepNodes: IVizStepNode[]): boolean {
    return stepNodes.length > 0 && stepNodes[0].data.label === 'ADD A STEP';
  }

  /**
   * Returns a Node index when provided with the `UUID`.
   * @param UUID
   * @param nodes
   */
  static findNodeIdxWithUUID(UUID: string, nodes: IVizStepNode[]) {
    return nodes.map((n) => n.data.step.UUID).indexOf(UUID);
  }

  /**
   * Accepts an array of React Flow nodes and edges,
   * build a new layouted graph with them
   * @param nodes
   * @param edges
   * @param direction
   */
  static async getLayoutedElements(
    nodes: IVizStepNode[],
    edges: IVizStepPropsEdge[],
    direction: string,
  ) {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const DEFAULT_WIDTH_HEIGHT = 80;
    const isHorizontal = direction === 'LR';

    dagreGraph.setGraph({
      edgesep: 50,
      nodesep: 50,
      rankdir: direction,
      ranksep: 80,
    });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: node.width ?? DEFAULT_WIDTH_HEIGHT,
        height: node.height ?? DEFAULT_WIDTH_HEIGHT,
      });
    });

    edges.forEach((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const dagreWeightedValues = VisualizationService.getDagreWeightedValues(
        isHorizontal,
        sourceNode,
      );

      dagreGraph.setEdge(edge.source, edge.target, dagreWeightedValues);
    });

    await dagre.layout(dagreGraph);

    nodes.forEach((flowNode) => {
      const nodeWithPosition = dagreGraph.node(flowNode.id);

      // We are shifting the dagre node position (anchor=center center) to the top left,
      // so it matches the React Flow node anchor point (top left).
      flowNode.position = {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      };

      flowNode.targetPosition = isHorizontal ? Position.Left : Position.Top;
      flowNode.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

      return flowNode;
    });

    return { layoutedNodes: nodes, layoutedEdges: edges };
  }

  static getDagreWeightedValues(
    isHorizontal: boolean,
    sourceNode?: IVizStepNode,
  ): { minlen: number; weight: number } {
    const adjustedHorizontalSpacing = sourceNode?.data.step.branches?.length > 1 ? 2 : 1;
    return {
      minlen: isHorizontal ? adjustedHorizontalSpacing : 1.5,
      weight: sourceNode?.data.step.branches?.length > 0 ? 2 : 1,
    };
  }

  /**
   * Accepts two UUIDs to compare, and a class name to use if they match
   * @param firstUuid
   * @param secondUuid
   * @param className
   */
  static getNodeClass(firstUuid: string, secondUuid: string, className: string): string {
    if (firstUuid === secondUuid) {
      return className;
    } else {
      return '';
    }
  }

  static insertAddStepPlaceholder(
    integrationId: string,
    stepNodes: IVizStepNode[],
    id: string,
    type: string,
    props: { [prop: string]: any },
  ) {
    return stepNodes.unshift({
      data: {
        label: 'ADD A STEP',
        step: {
          name: '',
          type: type,
          UUID: `placeholder-${getRandomArbitraryNumber()}`,
          integrationId,
        },
        isPlaceholder: true,
        ...props,
      },
      id,
      draggable: false,
      position: { x: 0, y: 0 },
      type: 'step',
      width: 80,
      height: 80,
    } as IVizStepNode);
  }

  static insertBranchGroupNode(
    stepNodes: Partial<IVizStepNode>[],
    position: { x: number; y: number },
    groupHeight: number,
    groupWidth: number,
    props?: { [prop: string]: any },
  ) {
    return stepNodes.unshift({
      id: getRandomArbitraryNumber().toString(),
      type: 'group',
      position,
      data: {
        ...props,
      },
      className: 'light',
      draggable: true,
      style: {
        border: 'dashed 1px rgba(37, 150, 190, 0.8)',
        width: groupWidth,
        height: groupHeight,
        backgroundColor: 'rgba(37, 150, 190, 0.1)',
      },
    });
  }

  /**
   * Determines if a node is the first and only node.
   * NOTE: Applies to both placeholders and normal steps.
   * @param stepNodeData
   */
  static isFirstAndOnlyNode(stepNodeData: IVizStepNodeData): boolean {
    return !stepNodeData.nextStepUuid && !stepNodeData.previousStepUuid && !stepNodeData.branchInfo;
  }

  /**
   * Redraw integration diagram on the canvas. If {@link rebuildNodes} is true,
   * It rebuilds the nodes and edges from integration JSON store and re-layout the diagram.
   * Otherwise, it only performs re-layout.
   * @param handleDeleteStep
   * @param rebuildNodes
   */
  async redrawDiagram(handleDeleteStep: HandleDeleteStepFn): Promise<void> {
    const ne = this.buildNodesAndEdges(handleDeleteStep);
    const layout = useVisualizationStore.getState().layout;

    return VisualizationService.getLayoutedElements(ne.stepNodes, ne.stepEdges, layout).then(
      (res) => {
        useVisualizationStore.getState().setNodes(res.layoutedNodes);
        useVisualizationStore.getState().setEdges(res.layoutedEdges);
      },
    );
  }

  /**
   * Given a node, determines if an edge should be created for it
   * @param node
   * @param nextNode
   */
  static shouldAddEdge(node: IVizStepNode, nextNode?: IVizStepNode): boolean {
    return node.data.step && nextNode && !StepsService.containsBranches(node.data.step);
  }

  /**
   * Determines whether to show a button for appending a step or inserting a branch
   * @param nodeData
   * @param isEndStep
   */
  static showAppendStepButton(nodeData: IVizStepNodeData, isEndStep: boolean) {
    const supportsBranching = !!(nodeData.step.minBranches || nodeData.step.maxBranches);
    // if it's an end step and there's no chance of adding a branch, there is nothing to append
    if (isEndStep && !supportsBranching) return false;

    // if it supports branching AND contains at least one branch, show it. otherwise users will
    // be able to add a branch through INSERT step, or append if it's the last in the array
    if (supportsBranching && nodeData.step.branches && nodeData.step.branches.length > 0) {
      // if max branches reached AND there is a next step, hide it, otherwise show it
      return !(
        ValidationService.reachedMaxBranches(
          nodeData.step.branches.length,
          nodeData.step.maxBranches,
        ) && nodeData.nextStepUuid
      );

      // handles when it's not an END step, but it's the last step in the array
    } else return !!(nodeData.isLastStep && !isEndStep);
  }

  /**
   * Determines whether to show a button for prepending a step.
   * Currently, this is for either steps that are not an end step,
   * or steps whose previous step contains branching.
   * @param nodeData
   */
  showPrependStepButton(nodeData: IVizStepNodeData) {
    if (nodeData.previousStepUuid) {
      // check if the previous step contains (nested) branches.
      const prevNodeIdx = VisualizationService.findNodeIdxWithUUID(
        nodeData.previousStepUuid,
        useVisualizationStore.getState().nodes,
      );
      return !!(
        useVisualizationStore.getState().nodes[prevNodeIdx] &&
        useVisualizationStore.getState().nodes[prevNodeIdx]?.data.step.branches?.length
      );
    } else if (!StepsService.isEndStep(nodeData.step) && nodeData.isFirstStep) {
      return true;
    }
  }

  /**
   * Determines whether to show the Branches tab in the mini catalog
   * @param step
   */
  static showBranchesTab(step: IStepProps): boolean {
    return StepsService.supportsBranching(step) && step.branches?.length !== step.maxBranches;
  }

  /**
   * Determines whether to show the Steps tab in the mini catalog
   * @param nodeData
   */
  static showStepsTab(nodeData: IVizStepNodeData): boolean {
    // if it contains branches and no next step, show the steps tab
    if (StepsService.containsBranches(nodeData.step) && !nodeData.nextStepUuid) return true;
    // if it doesn't contain branches, don't show the steps tab
    return !StepsService.containsBranches(nodeData.step);
  }

  static getEmptySelectedStep(): IStepProps {
    return {
      maxBranches: 0,
      minBranches: 0,
      name: '',
      type: '',
      UUID: '',
      integrationId: '',
    };
  }

  static displaySingleFlow(flowId: string): void {
    useVisualizationStore.getState().hideAllFlows();
    useVisualizationStore.getState().toggleFlowVisible(flowId, true);
  }

  static deleteFlowFromVisibleFlows(flowId: string): void {
    const visibleFlows = useVisualizationStore.getState().visibleFlows;
    delete visibleFlows[flowId];

    useVisualizationStore.getState().setVisibleFlows({ ...visibleFlows });
  }

  static renameVisibleFlow(oldId: string, newId: string): void {
    const visibleFlows = useVisualizationStore.getState().visibleFlows;
    const isFlowVisible = visibleFlows[oldId];
    delete visibleFlows[oldId];
    visibleFlows[newId] = isFlowVisible;

    useVisualizationStore.getState().setVisibleFlows(visibleFlows);
  }

  static setVisibleFlows(flowsIds: string[]): void {
    const previousVisibleFlows = useVisualizationStore.getState().visibleFlows;

    const visibleFlows = flowsIds.reduce(
      (acc, flow, index) => ({
        ...acc,
        /**
         * We keep the previous visibility state if any
         * otherwise, we set the first flow to visible
         * and the rest to invisible
         */
        [flow]: previousVisibleFlows[flow] ?? index === 0,
      }),
      {} as IVisibleFlows,
    );
    useVisualizationStore.getState().setVisibleFlows(visibleFlows);
  }

  static removeAllVisibleFlows(): void {
    useVisualizationStore.getState().setVisibleFlows({});
  }
}
