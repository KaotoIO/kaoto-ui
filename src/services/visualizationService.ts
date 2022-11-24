import Shifty from '@deepsource/shifty';
import { useIntegrationJsonStore } from '@kaoto/store';
import { IStepProps, IStepPropsBranch, IVizStepNode, IVizStepPropsEdge } from '@kaoto/types';
import { truncateString } from '@kaoto/utils';
import { ElkExtendedEdge, ElkNode } from 'elkjs';
import { MarkerType, Position } from 'reactflow';

const ELK = require('elkjs');

export function buildBranch(
  branchOriginStepNodes: IVizStepNode[],
  layout: string
): {
  branchNodes: IVizStepNode[];
  branchStepEdges: IVizStepPropsEdge[];
} {
  const allNodes: IVizStepNode[] = [];
  const stepEdges: IVizStepPropsEdge[] = [];

  // loop over step nodes that contain branches, create a branch group node for each
  branchOriginStepNodes.forEach((branchOriginStepNode) => {
    branchOriginStepNode.data.step.branches.forEach((branch: IStepPropsBranch) => {
      // create nodes for individual steps within a branch group
      const stepNodes = buildNodesFromSteps(branch.steps, layout, undefined, {
        branchIdentifier: branch.identifier,
        originalStepIndex: branchOriginStepNode.data.originalStepNodeIdx,
      });

      // create the per-branch-group normal step edges, special edges are handled later
      stepEdges.push(...buildEdges(stepNodes));
      allNodes.push(...stepNodes);
    });
  });

  return { branchNodes: allNodes, branchStepEdges: stepEdges };
}

// for nodes within a branch
export function buildBranchNodeParams(
  step: IStepProps,
  newId: string,
  layout: string,
  dataProps?: { [prop: string]: any }
): IVizStepNode {
  const shifty = new Shifty(false);
  return {
    data: {
      UUID: `b_${step.name}-${shifty.generate(16)}`,
      kind: step.kind,
      label: truncateString(step.name, 14),
      step,
      icon: step.icon,
      ...dataProps,
    },
    id: newId,
    position: { x: 0, y: 0 },
    draggable: true,
    sourcePosition: layout === 'RIGHT' ? Position.Top : Position.Right,
    targetPosition: layout === 'RIGHT' ? Position.Bottom : Position.Left,
    type: 'step',
  };
}

// Builds ONLY the edge cases where we need to connect branches to prev/next steps
export function buildBranchSpecialEdges(stepNodes: IVizStepNode[]): IVizStepPropsEdge[] {
  const specialEdges: IVizStepPropsEdge[] = [];

  stepNodes.forEach((node) => {
    if (node.type === 'group') return;

    // const ogNodeIndex = parseInt(node.data?.branchParentIndex);
    // const ogNodeNextIndex = parseInt(node.data?.branchParentNextIndex);
    const ogNodeIndex = stepNodes
      .map((node) => {
        return node.data.UUID;
      })
      .indexOf(node.data?.branchParentUuid);

    const ogNodeNextIndex = stepNodes
      .map((node) => {
        return node.data.UUID;
      })
      .indexOf(node.data?.branchParentNextUuid);

    // handle special first step, needs to be connected to previous step
    if (node.data?.isFirstStep) {
      const ogNodeStep = stepNodes[ogNodeIndex];
      const firstStep = node;

      let edgeProps: { id: string; source: string; target: string; [prop: string]: any } = {
        arrowHeadType: 'arrowclosed',
        id: `e-${ogNodeStep?.id}>${firstStep.id!}`,
        markerEnd: {
          type: MarkerType.Arrow,
        },
        source: ogNodeStep?.id,
        target: firstStep.id!,
        // users should not be able to add steps in between
        type: 'default',
      };

      if (node.data?.branchIdentifier) edgeProps.label = node.data.branchIdentifier;

      specialEdges.push(edgeProps);
    }

    // handle special last steps
    if (node.data?.step.type === 'MIDDLE' && node.data?.isLastStep) {
      const finalStep = node;
      const nextStep = stepNodes[ogNodeNextIndex];

      if (nextStep) {
        // it needs to merge back
        specialEdges.push({
          arrowHeadType: 'arrowclosed',
          id: `e-${finalStep.id!}>${nextStep.id}`,
          markerEnd: {
            type: MarkerType.Arrow,
          },
          source: finalStep.id!,
          target: nextStep.id,
          type: 'default',
        });
      }
    }
  });

  return specialEdges;
}

export function buildEdgeDefaultParams(
  currentStep: IVizStepNode,
  previousStep: IVizStepNode,
  props?: { [prop: string]: any }
): IVizStepPropsEdge {
  return {
    arrowHeadType: 'arrowclosed',
    id: `e-${previousStep.id}>${currentStep.id}`,
    markerEnd: {
      type: MarkerType.Arrow,
    },
    source: previousStep.id,
    // even the last step needs to build the step edge before it, with itself as the target
    target: currentStep.id,
    type:
      currentStep.data.kind === 'EIP' || previousStep.data.step?.branches ? 'default' : 'insert',
    ...props,
  };
}

export function buildEdges(nodes: IVizStepNode[]): IVizStepPropsEdge[] {
  const stepEdges: IVizStepPropsEdge[] = [];

  // for every node except for the first, add an edge
  nodes.slice(1).forEach((node, index) => {
    stepEdges.push(buildEdgeDefaultParams(node, nodes[index]));
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
      UUID: step.UUID,
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
  };
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
  let getId = (uuid: string) =>
    `node_${id++}-${uuid}` + (branchInfo ? `-b_${branchInfo.branchParentIndex}` : '');

  // if no steps or first step isn't START or an EIP, create a dummy placeholder step
  if (steps.length === 0 || (!isFirstStepStart(steps) && !isFirstStepEip(steps) && !branchInfo)) {
    insertAddStepPlaceholder(stepNodes, { id: getId('') });
  }

  steps.forEach((step, index) => {
    let currentStep: IVizStepNode;

    // build the default parameters for a node
    if (step.kind === 'EIP') {
      // if (branchInfo) {
      // we are within a branch
      currentStep = buildBranchNodeParams(
        step,
        getId(step.UUID ?? `${step.name}${index}`),
        layout,
        {
          ...props,
          ...branchInfo,
          branchStep: true,
          isFirstStep: index === 0,
          isLastStep: index === steps.length - 1,
        }
      );
      stepNodes.push(currentStep);
    } else {
      currentStep = buildNodeDefaultParams(step, getId(step.UUID ?? ''), props);
      stepNodes.push(currentStep);
    }

    const currentStepNodeIndex = stepNodes
      .map((node) => {
        return node.data.UUID;
      })
      .indexOf(step.UUID);

    if (step.branches && step.maxBranches !== 0) {
      step.branches.forEach((branch) => {
        stepNodes = stepNodes.concat(
          buildNodesFromSteps(branch.steps, layout, props, {
            branchIdentifier: branch.identifier,
            branchParentUuid: steps[index].UUID,
            // branchParentIndex: index,
            branchParentIndex: currentStepNodeIndex,
            branchParentNextUuid: steps[index + 1]?.UUID,
          })
        );
      });
    }
  });

  return stepNodes;
}

export function containsAddStepPlaceholder(stepNodes: IVizStepNode[]) {
  return stepNodes.length > 0 && stepNodes[0].data.label === 'ADD A STEP';
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

export function getNextStep(nodes: IVizStepNode[], currentStep?: IVizStepNode) {
  const currentStepIdx = nodes.map((s) => s.data.UUID).indexOf(currentStep?.data.UUID);
  return nodes[currentStepIdx + 1];
}

export function getRandomArbitraryNumber(): number {
  const crypto = window.crypto;
  return Math.floor(crypto?.getRandomValues(new Uint32Array(1))[0]);
}

export function insertAddStepPlaceholder(stepNodes: IVizStepNode[], props?: any) {
  return stepNodes.unshift({
    ...props,
    data: {
      label: 'ADD A STEP',
      step: {
        name: '',
        type: 'START',
      },
    },
    draggable: false,
    type: 'step',
    width: 80,
    height: 80,
  });
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
  return nodes[nodes.length - 1].data.UUID === UUID;
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
 */
export function regenerateUuids(steps: IStepProps[]) {
  const newSteps = steps.slice();
  newSteps.forEach((step, idx) => {
    step.UUID = step.name + idx;
    if (step.branches) {
      step.branches.forEach((branch, branchIdx) => {
        branch.steps.forEach((branchStep, branchStepIdx) => {
          branchStep.UUID = `s-${step.UUID}--b-${branchIdx}--${branchStep.name}${branchStepIdx}`;
        });
      });
    }
  });
  return newSteps;
}
