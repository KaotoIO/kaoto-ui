import { useIntegrationJsonStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps, IStepPropsBranch, IVizStepPropsEdge, IVizStepPropsNode } from '@kaoto/types';
import { truncateString } from '@kaoto/utils';
import { MarkerType } from 'react-flow-renderer';

export function buildBranchStepNodes(
  parentNode: IVizStepPropsNode,
  branches: IStepPropsBranch[],
  callback: (branchStepsAsNodes: IVizStepPropsNode[]) => void,
  incrementAmt?: number
) {
  branches?.map((branch) => {
    buildNodesFromSteps(
      branch.steps,
      (branchStepsAsNodes: IVizStepPropsNode[]) => callback(branchStepsAsNodes),
      {
        x: parentNode.position.x,
        y: parentNode.position.y - (incrementAmt ?? 160),
      }
    );
  });
}

export function buildEdge(currentStep: IVizStepPropsNode, previousStep: IVizStepPropsNode) {
  return {
    arrowHeadType: 'arrowclosed',

    // previousStep here is stale when deleting first step
    id: 'e-' + previousStep.id + '-' + currentStep.id,

    markerEnd: {
      type: MarkerType.Arrow,
    },
    source: previousStep.id,

    // even the last step needs to build the step edge before it, with itself as the target
    target: currentStep.id,
    type: 'insert',
  };
}

export function buildEdges(nodes: IVizStepPropsNode[]) {
  const stepEdges: IVizStepPropsEdge[] = [];

  // for every node except for the first, add an edge
  nodes.slice(1).map((node, index) => {
    const previousStep = nodes[index];
    stepEdges.push(buildEdge(node, previousStep));
  });

  return stepEdges;
}

export function buildNodeDefaultParams(
  step: IStepProps,
  newId: string,
  position: { x: number; y: number }
): IVizStepPropsNode {
  return {
    data: {
      icon: step.icon,
      kind: step.kind,
      label: truncateString(step.name, 14),
      step,
      UUID: step.UUID,
    },
    id: newId,
    position,
    type: 'step',
  };
}

/**
 * Creates an object for the Visualization from the Step model.
 * Contains UI-specific metadata (e.g. position).
 * Data is stored in the `nodes` and `edges` hooks.
 */
export function buildNodesFromSteps(
  steps: IStepProps[],
  callback: (stepsAsNodes: IVizStepPropsNode[]) => void,
  firstNodePosition?: { x: number; y: number },
  previousNodes?: IVizStepPropsNode[]
) {
  const incrementXAmt = 160;
  const incrementYAmt = 250;
  const nodes = previousNodes ?? useVisualizationStore.getState().nodes;
  const stepsAsNodes: IVizStepPropsNode[] = [];
  let id = 0;
  const getId = (uuid: string) => `${uuid}_${id++}`;

  const firstStepPosition = firstNodePosition ?? {
    x: window.innerWidth / 2 - incrementXAmt - 80,
    y: incrementYAmt,
  };

  // if there are no steps or if the first step isn't a
  // START or an EIP, create a dummy placeholder step
  if (steps.length === 0 || (!isFirstStepStart(steps) && !isFirstStepEip(steps))) {
    insertAddStepPlaceholder(stepsAsNodes, { id: getId(''), position: firstStepPosition });
  }

  steps.map((step, index) => {
    // Grab the previous step to use for determining position and drawing edges
    let previousStep = stepsAsNodes[index - 1];
    // if missing a START step, accommodate for ADD A STEP placeholder
    if (containsAddStepPlaceholder(stepsAsNodes)) {
      previousStep = stepsAsNodes[index];
    }

    // Build the default parameters
    const currentStepPosition = calculatePosition(
      index,
      nodes,
      firstStepPosition,
      incrementXAmt,
      previousStep
    );

    const currentStep: IVizStepPropsNode = buildNodeDefaultParams(
      step,
      getId(step.UUID!),
      currentStepPosition
    );

    stepsAsNodes.push(currentStep);
  });

  callback(stepsAsNodes);
}

export function buildSpecialFirstEdge(
  stepsAsNodes: IVizStepPropsNode[],
  nodeId: string,
  firstStepPosition: { x: number; y: number }
) {
  return insertAddStepPlaceholder(stepsAsNodes, { id: nodeId, position: firstStepPosition });
}

// export function buildSpecialLastEdge (stepsAsNodes: IVizStepPropsNode[], nodeId: string) {}

export function calculatePosition(
  stepIdx: number,
  nodes: IVizStepPropsNode[],
  firstStepPosition: { x: number; y: number },
  incrementXAmt: number,
  previousStep?: any
) {
  // check if there is a node with the same index,
  // use its position if there is
  if (nodes[stepIdx]) {
    return nodes[stepIdx].position;
  }
  if (!previousStep) {
    return firstStepPosition;
  } else {
    // return previous step position + specified increment amount (or default)
    return {
      x: previousStep.position.x + (incrementXAmt ?? 160),
      y: 250,
    };
  }
}

export function containsAddStepPlaceholder(stepsAsNodes: IVizStepPropsNode[]) {
  return stepsAsNodes.length > 0 && stepsAsNodes[0].data.label === 'ADD A STEP';
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

export function getNextStep(nodes: IVizStepPropsNode[], currentStep?: IVizStepPropsNode) {
  const currentStepIdx = nodes.map((s) => s.data.UUID).indexOf(currentStep?.data.UUID);
  return nodes[currentStepIdx + 1];
}

export function insertAddStepPlaceholder(stepsAsNodes: IVizStepPropsNode[], props?: any) {
  return stepsAsNodes.unshift({
    ...props,
    data: {
      label: 'ADD A STEP',
      step: {
        name: '',
        type: 'START',
      },
    },
    type: 'step',
  });
}

export function isFirstStepEip(steps: IStepProps[]): boolean {
  return steps.length > 0 && steps[0].kind === 'EIP';
}

export function isFirstStepStart(steps: IStepProps[]): boolean {
  return steps.length > 0 && steps[0].type === 'START';
}

export function isLastNode(nodes: IVizStepPropsNode[], UUID: string): boolean {
  return nodes[nodes.length - 1].data.UUID === UUID;
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
