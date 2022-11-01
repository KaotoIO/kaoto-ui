import { useIntegrationJsonStore } from '@kaoto/store';
import { IStepProps, IStepPropsBranch, IVizStepPropsEdge, IVizStepNode } from '@kaoto/types';
import { truncateString } from '@kaoto/utils';
import { MarkerType } from 'reactflow';

export function buildBranch(branchOriginStepNodes: IVizStepNode[]): {
  branchNodes: IVizStepNode[];
  branchStepEdges: IVizStepPropsEdge[];
} {
  // const incrementAmtX = 160;
  // const nodeWidth = 80;
  const allNodes: IVizStepNode[] = [];
  const groupNodes: IVizStepNode[] = [];
  const stepEdges: IVizStepPropsEdge[] = [];

  // loop over step nodes that contain branches, create a branch group node for each
  branchOriginStepNodes.forEach((branchOriginStepNode, originNodeIdx) => {
    branchOriginStepNode.data.step.branches.forEach((branch: IStepPropsBranch, idx: number) => {
      const groupHeight: number = 130;
      const groupWidth: number = branch.steps.length * 140;

      insertBranchGroupNode(
        groupNodes,
        { x: 0, y: 0 },
        // calculateBranchGroupPosition(
        //   nodeWidth,
        //   branchOriginStepNode,
        //   groupHeight,
        //   incrementAmtX,
        //   idx,
        //   groupNodes[idx - 1]
        // ),
        groupHeight,
        groupWidth,
        { parentUuid: branchOriginStepNode.data.UUID, ...branch }
      );

      allNodes.push(...groupNodes);

      // create nodes for individual steps within a branch group
      const { stepNodes } = buildNodesFromSteps(branch.steps, undefined, {
        branchId: groupNodes[idx].id!,
        branchIdentifier: branch.identifier,
        originalStepIndex: branchOriginStepNode.data.originalStepNodeIdx,
        // required for React Flow grouping; parentNode = branch group node ID
        parentNode: groupNodes[originNodeIdx].id,
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
  position: { x: number; y: number },
  branchId: string,
  index: number,
  dataProps?: { [prop: string]: any }
): IVizStepNode {
  return {
    data: {
      UUID: `b-${branchId}__${step.name}${index}`,
      kind: step.kind,
      label: truncateString(step.name, 14),
      step,
      icon: step.icon,
      ...dataProps,
    },
    id: newId,
    position,
    draggable: false,
    parentNode: branchId,
    type: 'step',
    extent: 'parent',
  };
}

// Builds ONLY the edge cases where we need to connect branches to prev/next steps
export function buildBranchSpecialEdges(
  branchNodes: IVizStepNode[],
  stepNodes: IVizStepNode[]
): IVizStepPropsEdge[] {
  const specialEdges: IVizStepPropsEdge[] = [];

  branchNodes.forEach((branchNode) => {
    if (branchNode.type === 'group') return;

    const ogNodeIndex = parseInt(branchNode.data?.originalStepIndex);

    // handle special first step, needs to be connected to previous step
    if (branchNode.extent === 'parent' && branchNode.data?.isFirstStep) {
      const ogNodeStep = stepNodes[ogNodeIndex];
      const firstStep = branchNode;

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

      if (branchNode.data?.branchIdentifier) edgeProps.label = branchNode.data.branchIdentifier;

      specialEdges.push(edgeProps);
    }

    // handle special last steps
    if (
      branchNode.extent === 'parent' &&
      branchNode.data.step.type === 'MIDDLE' &&
      branchNode.data.isLastStep
    ) {
      const finalStep = branchNode;
      const nextStep = stepNodes[ogNodeIndex + 1];
      
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
  props?: { [prop: string]: any }
): IVizStepNode {
  return {
    data: {
      UUID: step.UUID,
      kind: step.kind,
      label: truncateString(step.name, 14),
      step,
      icon: step.icon,
      ...props,
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
  props?: { [prop: string]: any },
  branchInfo?: { branchId: string; parentNode: string; [prop: string]: any }
) {
  const stepNodes: IVizStepNode[] = [];
  const branchOriginStepNodes: IVizStepNode[] = [];
  let id = 0;
  let getId = (uuid: string) =>
    `node_${id++}-${uuid}` + (branchInfo ? `-b_${branchInfo.parentNode}` : '');

  // if no steps or first step isn't START or an EIP, create a dummy placeholder step
  if (steps.length === 0 || (!isFirstStepStart(steps) && !isFirstStepEip(steps))) {
    insertAddStepPlaceholder(stepNodes, { id: getId('') });
  }

  steps.forEach((step, index) => {
    let currentStep: IVizStepNode;

    // build the default parameters for a node
    if (step.kind === 'EIP') {
      // we are within a branch
      currentStep = buildBranchNodeParams(
        step,
        getId(step.UUID ?? `${step.name}${index}`),
        { x: 0, y: 0 },
        branchInfo?.parentNode!,
        index,
        {
          ...branchInfo,
          ...props,
          isFirstStep: index === 0,
          isLastStep: index === steps.length - 1,
        }
      );
    } else {
      currentStep = buildNodeDefaultParams(step, getId(step.UUID ?? ''), props);
    }

    // if it has branches, push those to an array to deal with once all the
    // parent nodes are built and have their positions
    if (step.branches && step.maxBranches !== 0) {
      branchOriginStepNodes.push({
        ...currentStep,
        data: {
          ...currentStep.data,
          originalStepNodeIdx: index,
        },
      });
    }

    stepNodes.push(currentStep);
  });

  return { stepNodes, branchOriginStepNodes };
}

export function calculateBranchNextStepPosition(
  branchOriginStepNode: IVizStepNode,
  incrementAmountX: number,
  nodeWidth: number
) {
  const branches = branchOriginStepNode.data.step.branches;
  let positionX: number;
  // find the branch with the most steps in it
  const longestBranchIndex: number = branches.reduce(
    (p: number, c: any[], i: any[], a: any[]) => (a[p].length > c.length ? p : i),
    0
  );
  // calculate the width of that group
  const initialPosition = branchOriginStepNode.position.x + incrementAmountX;
  // multiply by the number of steps, add the increment amount to it
  positionX = initialPosition + branches[longestBranchIndex].steps.length * (nodeWidth * 2);
  return positionX;
}

export function calculateBranchGroupPosition(
  nodeWidth: number,
  branchOriginStepNode: IVizStepNode,
  groupHeight: number,
  incrementAmtX: number,
  index: number,
  previousBranchGroupNode?: IVizStepNode
) {
  let position = { x: 0, y: 0 };
  if (index === 0) {
    position = {
      x: branchOriginStepNode.position.x + incrementAmtX,
      y: branchOriginStepNode.position.y - nodeWidth * 1.5,
    };
  } else if (previousBranchGroupNode) {
    position = {
      x: previousBranchGroupNode.position.x,
      y: previousBranchGroupNode.position.y + (groupHeight + nodeWidth / 1.5),
    };
  }

  return position;
}

export function containsAddStepPlaceholder(stepNodes: IVizStepNode[]) {
  return stepNodes.length > 0 && stepNodes[0].data.label === 'ADD A STEP';
}

export function containsBranching(step: IStepProps): boolean {
  return step.maxBranches !== 0;
}

export function containsGroupNode(stepNodes: IVizStepNode[]) {
  return stepNodes.length > 0 && stepNodes[0].type === 'group';
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
    draggable: false,
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
  });
  return newSteps;
}
