import { useIntegrationJsonStore } from '@kaoto/store';
import { IStepProps, IVizStepNode, IVizStepPropsEdge } from '@kaoto/types';
import { truncateString } from '@kaoto/utils';
import { ElkExtendedEdge, ElkNode } from 'elkjs';
import { MarkerType, Position } from 'reactflow';

const ELK = require('elkjs');

// for nodes within a branch
export function buildBranchNodeParams(
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
    draggable: true,
    sourcePosition: layout === 'RIGHT' ? Position.Top : Position.Right,
    targetPosition: layout === 'RIGHT' ? Position.Bottom : Position.Left,
    type: 'step',
  } as IVizStepNode;
}

// Builds ONLY the edge cases where we need to connect branches to prev/next steps
export function buildBranchSpecialEdges(stepNodes: IVizStepNode[]): IVizStepPropsEdge[] {
  const specialEdges: IVizStepPropsEdge[] = [];

  stepNodes.forEach((node) => {
    if (node.type === 'group') return;

    const parentNodeIndex = findNodeIdxWithUUID(node.data.parentUuid, stepNodes);
    const ogNodeNextIndex = findNodeIdxWithUUID(node.data.branchParentNextUuid, stepNodes);

    // handle all "normal" steps within a branch
    if (node.data.branchStep && !node.data.isLastStep && !containsBranches(node.data.step)) {
      const branchStepNextIdx = findNodeIdxWithUUID(node.data.nextStepUuid, stepNodes);
      if (stepNodes[branchStepNextIdx]) {
        specialEdges.push(buildEdgeParams(node, stepNodes[branchStepNextIdx], 'default'));
      }
    }

    // handle special first step, needs to be connected to its immediate parent
    if (node.data.isFirstStep) {
      const ogNodeStep = stepNodes[parentNodeIndex];
      let edgeProps = buildEdgeParams(ogNodeStep, node, 'default');

      if (node.data.branchIdentifier) edgeProps.label = node.data.branchIdentifier;

      specialEdges.push(edgeProps);
    }

    // handle special last steps
    if (node.data.isLastStep) {
      const nextStep = stepNodes[ogNodeNextIndex];

      if (nextStep) {
        // it needs to merge back
        specialEdges.push(buildEdgeParams(node, nextStep, 'default'));
      }
    }
  });

  return specialEdges;
}

export function buildEdgeParams(
  sourceStep: IVizStepNode,
  targetStep: IVizStepNode,
  type?: string
): IVizStepPropsEdge {
  return {
    arrowHeadType: 'arrowclosed',
    id: `e-${sourceStep.id}>${targetStep.id}`,
    markerEnd: {
      type: MarkerType.Arrow,
    },
    source: sourceStep.id,
    target: targetStep.id,
    type: type ?? 'default',
  };
}

export function buildEdges(nodes: IVizStepNode[]): IVizStepPropsEdge[] {
  const stepEdges: IVizStepPropsEdge[] = [];

  // for every node except for placeholders and the last step, add an edge
  if (nodes.length === 1) {
    return stepEdges;
  }

  nodes.forEach((node) => {
    const nextNodeIdx = findNodeIdxWithUUID(node.data.nextStepUuid, nodes);

    if (node.data.step && nodes[nextNodeIdx] && !containsBranches(node.data.step)) {
      stepEdges.push(
        buildEdgeParams(
          node,
          nodes[nextNodeIdx],
          node.data.branchInfo || node.data.step.branches ? 'default' : 'insert'
        )
      );
    }
  });

  return stepEdges;
}

export function buildNodeDefaultParams(
  step: IStepProps,
  newId: string,
  props?: { [prop: string]: any },
  branchInfo?: { [prop: string]: any }
): IVizStepNode {
  return {
    data: {
      kind: step.kind,
      label: truncateString(step.name, 14),
      step,
      icon: step.icon,
      ...props,
      ...branchInfo,
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
 * Creates an object for the Visualization from the Step model.
 * Contains UI-specific metadata (e.g. position).
 * Data is stored in the `nodes` hook.
 */
export function buildNodesFromSteps(
  steps: IStepProps[],
  layout: string,
  props?: { [prop: string]: any },
  branchInfo?: { [prop: string]: any }
) {
  let stepNodes: IVizStepNode[] = [];
  let id = 0;
  let getId = (uuid: string) => `node_${id++}-${uuid}-${getRandomArbitraryNumber()}`;

  // if no steps or first step isn't START or an EIP, create a dummy placeholder step
  if (steps.length === 0 || (!isFirstStepStart(steps) && !isFirstStepEip(steps) && !branchInfo)) {
    insertAddStepPlaceholder(stepNodes, { id: getId(''), nextStepUuid: steps[0]?.UUID });
  }

  steps.forEach((step, index) => {
    let currentStep: IVizStepNode;

    // build the default parameters for a node
    if (branchInfo) {
      // we are within a branch
      currentStep = buildBranchNodeParams(step, getId(step.UUID), layout, {
        ...props,
        ...branchInfo,
        branchStep: true,
        isFirstStep: index === 0,
        isLastStep: index === steps.length - 1 && !step.branches?.length,
        nextStepUuid: steps[index + 1]?.UUID,
      });
      stepNodes.push(currentStep);
    } else {
      currentStep = buildNodeDefaultParams(step, getId(step.UUID ?? ''), {
        ...props,
        nextStepUuid: steps[index + 1]?.UUID,
      });
      stepNodes.push(currentStep);
    }

    if (step.branches && step.maxBranches !== 0) {
      step.branches.forEach((branch) => {
        stepNodes = stepNodes.concat(
          buildNodesFromSteps(branch.steps, layout, props, {
            branchIdentifier: branch.identifier,

            // branchParentUuid is the parent for a first branch step,
            // and grandparent for n branch step
            branchParentUuid: branchInfo?.branchParentUuid ?? steps[index].UUID,
            branchParentNextUuid: branchInfo?.branchParentNextUuid ?? steps[index + 1]?.UUID,

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
export function containsAddStepPlaceholder(stepNodes: IVizStepNode[]) {
  return stepNodes.length > 0 && stepNodes[0].data.label === 'ADD A STEP';
}

/**
 * Checks if a Step contains branches
 * @param step
 */
export function containsBranches(step: IStepProps): boolean {
  let containsBranching = false;
  if (step.branches && step.branches.length > 0) {
    containsBranching = true;
  }
  return containsBranching;
}

/**
 * Returns a Step index when provided with the `UUID`.
 * `UUID` is originally set using the Step UUID.
 * @param UUID
 * @param steps
 */
export function findStepIdxWithUUID(UUID: string, steps?: IStepProps[]) {
  // optional steps allows for dependency injection in testing
  if (!steps) {
    return useIntegrationJsonStore
      .getState()
      .integrationJson.steps.map((s) => s.UUID)
      .indexOf(UUID);
  } else {
    return steps.map((s) => s.UUID).indexOf(UUID);
  }
}

/**
 * Returns a Node index when provided with the `UUID`.
 * @param UUID
 * @param nodes
 */
export function findNodeIdxWithUUID(UUID: string, nodes: IVizStepNode[]) {
  return nodes.map((n) => n.data.step.UUID).indexOf(UUID);
}

export async function getLayoutedElements(
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

export function getRandomArbitraryNumber(): number {
  const crypto = window.crypto;
  return Math.floor(crypto?.getRandomValues(new Uint32Array(1))[0]);
}

export function insertAddStepPlaceholder(
  stepNodes: IVizStepNode[],
  props: { id: string; nextStepUuid: string }
) {
  return stepNodes.unshift({
    ...props,
    data: {
      label: 'ADD A STEP',
      step: {
        maxBranches: 0,
        minBranches: 0,
        name: '',
        type: 'START',
        UUID: '',
      },
      nextStepUuid: props.nextStepUuid,
    },
    id: props.id,
    draggable: false,
    position: { x: 0, y: 0 },
    type: 'step',
    width: 80,
    height: 80,
  } as IVizStepNode);
}

export function insertBranchGroupNode(
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

export function isFirstStepEip(steps: IStepProps[]): boolean {
  return steps.length > 0 && steps[0].kind === 'EIP';
}

export function isFirstStepStart(steps: IStepProps[]): boolean {
  return steps.length > 0 && steps[0].type === 'START';
}

export function isLastNode(nodes: IVizStepNode[], UUID: string): boolean {
  return nodes[nodes.length - 1].data.step.UUID === UUID;
}

export function isEipStep(step: IStepProps): boolean {
  return step.kind === 'EIP';
}

export function isEndStep(step: IStepProps): boolean {
  return step.type === 'END';
}

export function isMiddleStep(step: IStepProps): boolean {
  return step.type === 'MIDDLE';
}

export function isStartStep(step: IStepProps): boolean {
  return step.type === 'START';
}

/**
 * Regenerate a UUID for a list of Steps
 * Every time there is a change to steps or their positioning in the Steps array,
 * their UUIDs need to be regenerated
 * @param steps
 * @param branchSteps
 */
export function regenerateUuids(steps: IStepProps[], branchSteps: boolean = false) {
  let newSteps = steps.slice();

  newSteps.forEach((step, idx) => {
    step.UUID = `${step.name}-${idx}`;
    if (branchSteps) step.UUID = `${step.name}-${idx}-${getRandomArbitraryNumber()}`;
    if (step.branches) {
      step.branches.forEach((branch) => {
        return newSteps.concat(regenerateUuids(branch.steps, true));
      });
    }
  });
  return newSteps;
}
