import { StepsService } from './stepsService';
import { ValidationService } from './validationService';
import { IIntegrationJsonStore, RFState } from '@kaoto/store';
import {
  IStepProps,
  IVizStepNode,
  IVizStepNodeData,
  IVizStepNodeDataBranch,
  IVizStepPropsEdge,
} from '@kaoto/types';
import { getRandomArbitraryNumber, truncateString } from '@kaoto/utils';
import { ElkExtendedEdge, ElkNode } from 'elkjs';
import { MarkerType, Position } from 'reactflow';

const ELK = require('elkjs');

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
  constructor(
    private integrationJsonStore: IIntegrationJsonStore,
    private visualizationStore: RFState
  ) { }

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
    dataProps?: { [prop: string]: any }
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
    edgeType?: string
  ): IVizStepPropsEdge[] {
    const branchPlaceholderEdges: IVizStepPropsEdge[] = [];
    let edgeProps = VisualizationService.buildEdgeParams(rootNode, node, edgeType ?? 'default');

    if (node.data.branchInfo?.branchIdentifier)
      edgeProps.label = node.data.branchInfo?.branchIdentifier;

    branchPlaceholderEdges.push(edgeProps);

    if (rootNextNode) {
      branchPlaceholderEdges.push(
        VisualizationService.buildEdgeParams(node, rootNextNode, edgeType ?? 'default')
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
        node.data.branchInfo?.parentUuid,
        stepNodes
      );
      const rootStepNextIndex = VisualizationService.findNodeIdxWithUUID(
        node.data.branchInfo?.rootStepNextUuid,
        stepNodes
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
            stepNodes
          );
          if (stepNodes[branchStepNextIdx]) {
            specialEdges.push(
              VisualizationService.buildEdgeParams(node, stepNodes[branchStepNextIdx], 'insert')
            );
          }
        }

        // handle special first step, needs to be connected to its immediate parent
        if (node.data.isFirstStep) {
          const parentStepNode: IVizStepNode = stepNodes[parentNodeIndex];
          const showDeleteEdge = ValidationService.reachedMinBranches(
            parentStepNode.data.step.branches.length,
            parentStepNode.data.step.minBranches
          );
          let edgeProps = VisualizationService.buildEdgeParams(
            parentStepNode,
            node,
            showDeleteEdge ? 'delete' : 'default'
          );

          if (node.data.branchInfo?.branchIdentifier)
            edgeProps.label = node.data.branchInfo?.branchIdentifier;

          specialEdges.push(edgeProps);
        }

        // handle placeholder steps within a branch
        if (node.data.branchInfo?.branchStep && node.data.isPlaceholder) {
          const parentStepNode: IVizStepNode = stepNodes[parentNodeIndex];
          const showDeleteEdge = ValidationService.reachedMinBranches(
            parentStepNode.data.step.branches.length,
            parentStepNode.data.step.minBranches
          );

          specialEdges.push(
            ...VisualizationService.buildBranchSingleStepEdges(
              node,
              stepNodes[parentNodeIndex],
              stepNodes[rootStepNextIndex],
              showDeleteEdge ? 'delete' : 'default'
            )
          );
        }

        // handle special last steps
        if (node.data.isLastStep && !StepsService.isEndStep(node.data.step)) {
          const nextStep = stepNodes[rootStepNextIndex];

          if (nextStep) {
            // it needs to merge back
            specialEdges.push(VisualizationService.buildEdgeParams(node, nextStep, 'default'));
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
    type?: string
  ): IVizStepPropsEdge {
    return {
      arrowHeadType: 'arrowclosed',
      id: `e-${sourceStep.id}>${targetStep.id}`,
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
            node.data.branchInfo || node.data.step.branches?.length > 0 ? 'default' : 'insert'
          )
        );
      }
    });

    return stepEdges;
  }

  static buildNodeDefaultParams(
    step: IStepProps,
    newId: string,
    props?: { [prop: string]: any },
    branchInfo?: IVizStepNodeDataBranch
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
  buildNodesAndEdges(handleDeleteStep: (uuid: string) => void) {
    const steps = this.integrationJsonStore.integrationJson.steps;
    const layout = this.visualizationStore.layout;
    // build all nodes
    const stepNodes = VisualizationService.buildNodesFromSteps(steps, layout, {
      handleDeleteStep,
    });

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
    steps: IStepProps[],
    layout: string,
    props?: { [prop: string]: any },
    branchInfo?: IVizStepNodeDataBranch
  ): IVizStepNode[] {
    let stepNodes: IVizStepNode[] = [];
    let id = 0;
    let getId = (uuid: string) => `node_${id++}-${uuid}-${getRandomArbitraryNumber()}`;

    // if no steps or first step isn't START, create a dummy placeholder step
    if (
      (steps.length === 0 && !branchInfo) ||
      (!StepsService.isFirstStepStart(steps) && !branchInfo)
    ) {
      VisualizationService.insertAddStepPlaceholder(stepNodes, getId(''), 'START', {
        nextStepUuid: steps[0]?.UUID,
      });
    }

    // build EIP placeholder
    if (branchInfo && steps.length === 0 && !StepsService.isFirstStepStart(steps)) {
      VisualizationService.insertAddStepPlaceholder(stepNodes, getId(''), 'MIDDLE', {
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
            VisualizationService.buildNodesFromSteps(branch.steps, layout, props, {
              branchIdentifier: branch.identifier,

              // rootStepUuid is the parent for a first branch step,
              // and grandparent for n branch step
              rootStepUuid: branchInfo?.rootStepUuid ?? steps[index].UUID,
              rootStepNextUuid: branchInfo?.rootStepNextUuid ?? steps[index + 1]?.UUID,
              branchStep: true,
              branchUuid: branch.branchUuid,

              // parentUuid is always the parent of the branch step, no matter how nested
              parentUuid: steps[index].UUID,
            })
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
   * build a new ELK layout graph with them
   * @param nodes
   * @param edges
   * @param direction
   */
  static async getLayoutedElements(
    nodes: IVizStepNode[],
    edges: IVizStepPropsEdge[],
    direction: string
  ) {
    const DEFAULT_WIDTH_HEIGHT = 80;
    const isHorizontal = direction === 'RIGHT';

    const elk = new ELK({
      defaultLayoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': direction,

        // vertical spacing of nodes
        'elk.spacing.nodeNode': DEFAULT_WIDTH_HEIGHT / 2,

        // ensures balanced, linear graph from beginning to end
        'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',

        // *between handles horizontal spacing
        'elk.layered.spacing.nodeNodeBetweenLayers': DEFAULT_WIDTH_HEIGHT,
        'elk.layered.spacing.edgeEdgeBetweenLayers': DEFAULT_WIDTH_HEIGHT * 1.5,
        'spacing.componentComponent': '70',
        spacing: '75',

        // ensures correct order of nodes (particularly important for branches)
        'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
      },
    });

    const elkNodes: ElkNode[] = [];
    const elkEdges: ElkExtendedEdge[] = [];

    nodes.forEach((flowNode) => {
      elkNodes.push({
        id: flowNode.id,
        width: flowNode.width ?? DEFAULT_WIDTH_HEIGHT,
        height: flowNode.height ?? DEFAULT_WIDTH_HEIGHT,
      });
    });

    edges.forEach((flowEdge) => {
      elkEdges.push({
        id: flowEdge.id,
        targets: [flowEdge.target],
        sources: [flowEdge.source],
      });
    });

    const newGraph = await elk.layout({
      id: 'root',
      portConstraints: 'FIXED_ORDER',
      children: elkNodes,
      edges: elkEdges,
    });

    nodes.forEach((flowNode) => {
      const node = newGraph?.children?.find((n: { id: string }) => n.id === flowNode.id);
      if (node?.x && node?.y && node?.width && node?.height) {
        flowNode.position = {
          x: node.x - node.width / 2,
          y: node.y - node.height / 2,
        };

        flowNode.targetPosition = isHorizontal ? Position.Left : Position.Top;
        flowNode.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
      }
      return flowNode;
    });

    return { layoutedNodes: nodes, layoutedEdges: edges };
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
    stepNodes: IVizStepNode[],
    id: string,
    type: string,
    props: { [prop: string]: any }
  ) {
    return stepNodes.unshift({
      data: {
        label: 'ADD A STEP',
        step: {
          name: '',
          type: type,
          UUID: `placeholder-${getRandomArbitraryNumber()}`,
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
    props?: { [prop: string]: any }
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
  async redrawDiagram(handleDeleteStep: (uuid: string) => void, rebuildNodes: boolean) {
    let stepNodes = this.visualizationStore.nodes;
    let stepEdges = this.visualizationStore.edges;
    if (rebuildNodes) {
      const ne = this.buildNodesAndEdges(handleDeleteStep);
      stepNodes = ne.stepNodes;
      stepEdges = ne.stepEdges;
    }
    VisualizationService.getLayoutedElements(
      stepNodes,
      stepEdges,
      this.visualizationStore.layout
    ).then((res) => {
      const { layoutedNodes, layoutedEdges } = res;
      this.visualizationStore.setNodes(layoutedNodes);
      this.visualizationStore.setEdges(layoutedEdges);
    });
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
          nodeData.step.maxBranches
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
        this.visualizationStore.nodes
      );
      return !!(
        this.visualizationStore.nodes[prevNodeIdx] &&
        this.visualizationStore.nodes[prevNodeIdx]?.data.step.branches?.length
      );
    } else if (!StepsService.isEndStep(nodeData.step) && nodeData.isFirstStep) {
      return true;
    }
  }

  /**
   * Determines whether to show the Branches tab in the mini catalog
   * @param nodeData
   */
  static showBranchesTab(nodeData: IVizStepNodeData): boolean {
    return (
      StepsService.supportsBranching(nodeData.step) &&
      nodeData.step.branches?.length !== nodeData.step.maxBranches
    );
  }

  /**
   * Determines whether to show the Steps tab in the mini catalog
   * @param nodeData
   */
  static showStepsTab(nodeData: IVizStepNodeData): boolean {
    if (StepsService.containsBranches(nodeData.step) && !nodeData.nextStepUuid) return true;
    return !StepsService.containsBranches(nodeData.step);
  }
}
