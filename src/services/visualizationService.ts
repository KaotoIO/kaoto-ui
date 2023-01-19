import { useIntegrationJsonStore } from '@kaoto/store';
import {
  INestedStep,
  IStepProps,
  IStepPropsBranch,
  IVizStepNode,
  IVizStepNodeDataBranch,
  IVizStepPropsEdge,
} from '@kaoto/types';
import { findPath, truncateString } from '@kaoto/utils';
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
    draggable: false,
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

    const parentNodeIndex = findNodeIdxWithUUID(node.data.branchInfo?.parentUuid, stepNodes);
    const ogNodeNextIndex = findNodeIdxWithUUID(
      node.data.branchInfo?.branchParentNextUuid,
      stepNodes
    );

    // handle all "normal" steps within a branch
    if (
      node.data.branchInfo?.branchStep &&
      !node.data.isLastStep &&
      !containsBranches(node.data.step)
    ) {
      const branchStepNextIdx = findNodeIdxWithUUID(node.data.nextStepUuid, stepNodes);
      if (stepNodes[branchStepNextIdx]) {
        specialEdges.push(buildEdgeParams(node, stepNodes[branchStepNextIdx], 'insert'));
      }
    }

    // handle special first step, needs to be connected to its immediate parent
    if (node.data.isFirstStep) {
      const ogNodeStep = stepNodes[parentNodeIndex];
      let edgeProps = buildEdgeParams(ogNodeStep, node, 'default');

      if (node.data.branchInfo?.branchIdentifier)
        edgeProps.label = node.data.branchInfo?.branchIdentifier;

      specialEdges.push(edgeProps);
    }

    // handle special last steps
    if (node.data.isLastStep || isEndStep(node.data.step)) {
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

    if (shouldAddEdge(node, nodes[nextNodeIdx])) {
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
  branchInfo?: IVizStepNodeDataBranch
): IVizStepNode {
  return {
    data: {
      branchInfo,
      icon: step.icon,
      kind: step.kind,
      label: truncateString(step.name, 14),
      step,
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
 * Creates an array for the Visualization from the Step model.
 * Contains UI-specific metadata (e.g. position).
 * Data is stored in the `nodes` hook.
 */
export function buildNodesFromSteps(
  steps: IStepProps[],
  layout: string,
  props?: { [prop: string]: any },
  branchInfo?: IVizStepNodeDataBranch
): IVizStepNode[] {
  let stepNodes: IVizStepNode[] = [];
  let id = 0;
  let getId = (uuid: string) => `node_${id++}-${uuid}-${getRandomArbitraryNumber()}`;

  // if no steps or first step isn't START or an EIP, create a dummy placeholder step
  if (
    (steps.length === 0 && !branchInfo) ||
    (!isFirstStepStart(steps) && !isFirstStepEip(steps) && !branchInfo)
  ) {
    insertAddStepPlaceholder(stepNodes, { id: getId(''), nextStepUuid: steps[0]?.UUID });
  }

  steps.forEach((step, index) => {
    let currentStep: IVizStepNode;

    // build the default parameters for a node
    if (branchInfo) {
      // we are within a branch
      currentStep = buildBranchNodeParams(step, getId(step.UUID), layout, {
        ...props,
        branchInfo,
        isFirstStep: index === 0,
        isLastStep: index === steps.length - 1 && !step.branches?.length,
        nextStepUuid: steps[index + 1]?.UUID,
      });
      stepNodes.push(currentStep);
    } else {
      currentStep = buildNodeDefaultParams(step, getId(step.UUID), {
        nextStepUuid: steps[index + 1]?.UUID,
        ...props,
      });
      stepNodes.push(currentStep);
    }

    // recursively build nodes for branch steps
    if (step.branches && step.maxBranches !== 0) {
      step.branches.forEach((branch) => {
        stepNodes = stepNodes.concat(
          buildNodesFromSteps(branch.steps, layout, props, {
            branchIdentifier: branch.identifier,

            // branchParentUuid is the parent for a first branch step,
            // and grandparent for n branch step
            branchParentUuid: branchInfo?.branchParentUuid ?? steps[index].UUID,
            branchParentNextUuid: branchInfo?.branchParentNextUuid ?? steps[index + 1]?.UUID,
            branchStep: true,

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
export function containsAddStepPlaceholder(stepNodes: IVizStepNode[]): boolean {
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
 * Given an array of Steps, return an array containing *only*
 * the steps which are nested
 * @param steps
 */
export function extractNestedSteps(steps: IStepProps[]) {
  let tempSteps = steps.slice();
  let nestedSteps: INestedStep[] = [];

  const loopOverSteps = (steps: IStepProps[], originalStepUuid?: string) => {
    steps.forEach((step) => {
      if (originalStepUuid) {
        // this is a nested step
        nestedSteps.push({
          stepUuid: step.UUID,
          originStepUuid: originalStepUuid,
          path: findPath(tempSteps, step.UUID, 'UUID'),
        });
      }

      if (step.branches) {
        step.branches.forEach((branch) => {
          // it contains nested steps; we will need to store the branch info
          // and the path to it, for each of those steps
          return loopOverSteps(branch.steps, step.UUID);
        });
      }
    });
  };

  loopOverSteps(tempSteps);

  return nestedSteps;
}

/**
 * Given an array of steps and a function with a condition,
 * return a new filtered array
 * @param steps
 * @param predicate
 */
export function filterNestedSteps(steps: IStepProps[], predicate: (step: IStepProps) => boolean) {
  return !steps
    ? null
    : steps.reduce((list: IStepProps[], step: IStepProps) => {
        let clone: IStepProps | null = null;

        if (predicate(step) && steps.some((s) => s.UUID === step.UUID)) {
          // clone the step if it matches the condition and isn't a nested step
          clone = Object.assign({}, step);
        }

        // overwrite the branch if one of its steps contains a match
        if (clone && clone.branches) {
          clone.branches.forEach((branch, idx) => {
            const filteredBranchSteps = filterNestedSteps(branch.steps, predicate);
            if (filteredBranchSteps && clone?.branches) {
              clone.branches[idx].steps = filteredBranchSteps;
            }
          });
        }

        // if there's a cloned step, push it to the output list
        clone && list.push(clone);
        return list;
      }, []);
}

/**
 * Returns a Step index when provided with the `UUID`.
 * `UUID` is originally set using the Step UUID.
 * @param UUID
 * @param steps
 */
export function findStepIdxWithUUID(UUID: string, steps?: IStepProps[]): number {
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
 * Given a step and a function with a condition,
 * return a new step with filtered branch steps
 * @param step
 * @param predicate
 */
export function filterStepWithBranches(step: IStepProps, predicate: (step: IStepProps) => boolean) {
  const stepCopy: IStepProps = { ...step };
  const loopOverBranches = (branches: IStepPropsBranch[]) => {
    if (step.branches?.length === 0) return;
    branches.forEach((branch, idx) => {
      const branchCopy = { ...branch };
      if (stepCopy.branches && stepCopy.branches[idx].steps) {
        const filtered = filterNestedSteps(branchCopy.steps, predicate);
        if (filtered) stepCopy.branches[idx].steps = filtered;
      }
    });
  };

  if (stepCopy.branches) loopOverBranches(stepCopy.branches);

  return stepCopy;
}

/**
 * Returns a Node index when provided with the `UUID`.
 * @param UUID
 * @param nodes
 */
export function findNodeIdxWithUUID(UUID: string, nodes: IVizStepNode[]) {
  return nodes.map((n) => n.data.step.UUID).indexOf(UUID);
}

/**
 * Flattens a deeply nested array of Steps and their respective
 * branches, and their Steps, into a single array.
 * Typically used for quickly fetching a Step.
 */
export function flattenSteps(steps: IStepProps[]): IStepProps[] {
  let children: IStepProps[] = [];
  const flattenMembers = steps.map((s) => {
    if (s.branches && s.branches.length) {
      s.branches.forEach((b) => {
        children = [...children, ...b.steps];
      });
    }
    return s;
  });

  return flattenMembers.concat(children.length ? flattenSteps(children) : children);
}

/**
 * Accepts an array of React Flow nodes and edges,
 * build a new ELK layout graph with them
 * @param nodes
 * @param edges
 * @param direction
 */
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

/**
 * Insert the given step at the specified index of
 * an array of provided steps
 * @param steps
 * @param insertIndex
 * @param newStep
 */
export function insertStep(steps: IStepProps[], insertIndex: number, newStep: IStepProps) {
  return [
    // part of array before the index
    ...steps.slice(0, insertIndex),
    // inserted item
    newStep,
    // part of array after the index
    ...steps.slice(insertIndex),
  ];
}

export function isEndStep(step: IStepProps): boolean {
  return step.type === 'END';
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
export function regenerateUuids(steps: IStepProps[], branchSteps: boolean = false): IStepProps[] {
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

/**
 * Given a node, determines if an edge should be created for it
 * @param node
 * @param nextNode
 */
export function shouldAddEdge(node: IVizStepNode, nextNode?: IVizStepNode): boolean {
  return (
    node.data.step &&
    nextNode &&
    // it either contains no branches, or those branches don't have any steps in them
    (!containsBranches(node.data.step) ||
      (containsBranches(node.data.step) &&
        node.data.step.branches.some((b: IStepPropsBranch) => b.steps.length === 0)))
  );
}
