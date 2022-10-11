import eipIntegration from '../store/data/branchSteps';
import branchSteps from '../store/data/branchSteps';
import nodes from '../store/data/nodes';
import steps from '../store/data/steps';
import {
  buildEdgeDefaultParams,
  buildEdges,
  buildNodeDefaultParams,
  buildNodesFromSteps,
  calculatePosition,
  containsAddStepPlaceholder,
  findStepIdxWithUUID,
  getNextStep,
  getRandomArbitraryNumber,
  insertAddStepPlaceholder,
  insertBranchGroupNode,
  isEipStep,
  isEndStep,
  isFirstStepEip,
  isFirstStepStart,
  isMiddleStep,
  isStartStep,
  regenerateUuids,
} from './visualizationService';
import { IVizStepNode } from '@kaoto/types';
import { truncateString } from '@kaoto/utils';
import { MarkerType } from 'reactflow';

describe('visualizationService', () => {
  const groupWidth = 80;

  /**
   * buildEdgeDefaultParams
   */
  it("buildEdgeDefaultParams(): should build an edge's default parameters for a single given node", () => {
    const currentStep = nodes[1];
    const previousStep = nodes[0];

    expect(buildEdgeDefaultParams(currentStep, previousStep)).toEqual({
      arrowHeadType: 'arrowclosed',

      // previousStep here is stale when deleting first step
      id: 'e-' + previousStep.id + '>' + currentStep.id,

      markerEnd: {
        type: MarkerType.Arrow,
      },
      source: previousStep.id,

      // even the last step needs to build the step edge before it, with itself as the target
      target: currentStep.id,
      type: 'insert',
    });
  });

  /**
   * buildEdges
   */
  it('buildEdges(): should build an edge for every node except the first, given an array of nodes', () => {
    const nodes = [
      { data: { label: 'aws-kinesis-source' }, id: 'dndnode_1', position: { x: 720, y: 250 } },
      { data: { label: 'avro-deserialize-sink' }, id: 'dndnode_2', position: { x: 880, y: 250 } },
    ];

    expect(buildEdges(nodes)).toHaveLength(1);

    // let's test that it works for branching too
    const { stepNodes } = buildNodesFromSteps(branchSteps);

    expect(buildEdges(stepNodes)).toHaveLength(branchSteps.length - 1);
  });

  /**
   * buildNodeDefaultParams
   */
  it('buildNodeDefaultParams(): should build the default parameters for a single node, given a step', () => {
    const position = { x: 0, y: 0 };
    const step = nodes[1].data.step;

    expect(buildNodeDefaultParams(step, 'dummy-id', position)).toEqual({
      data: {
        icon: step.icon,
        kind: step.kind,
        label: truncateString(step.name, 14),
        step,
        UUID: step.UUID,
      },
      id: 'dummy-id',
      position: { x: 0, y: 0 },
      type: 'step',
    });
  });

  /**
   * buildNodesFromSteps
   */
  it('buildNodesFromSteps(): should build visualization nodes from an array of steps', () => {
    const { stepNodes } = buildNodesFromSteps(steps);
    expect(stepNodes[0].data.UUID).toBeDefined();
    expect(stepNodes[0].id).toEqual('node_0-0twitter-search-source');
  });

  /**
   * buildNodesFromSteps for integrations with branches
   */
  it.skip('buildNodesFromSteps(): should build visualization nodes from an array of steps with branches', () => {
    const { stepNodes } = buildNodesFromSteps(branchSteps);
    expect(stepNodes[0].data.UUID).toBeDefined();
    expect(stepNodes).toHaveLength(branchSteps.length);
  });

  /**
   * calculatePosition
   */
  it('calculatePosition(): should calculate the very first position of a node', () => {
    // no previous step provided, use coordinates for first step provided
    expect(calculatePosition(0, { x: 500, y: 250 }, 160, 80)).toEqual({
      x: 500,
      y: 250,
    });
  });

  /**
   * calculatePosition
   */
  it('calculatePosition(): should increment the position when a previous step is provided', () => {
    const nodes = [
      { data: { label: 'aws-kinesis-source' }, id: 'dndnode_1', position: { x: 720, y: 250 } },
    ];

    // should increment from previous step, and will not inherit any position,
    // as there is no existing node with the same index
    expect(calculatePosition(1, { x: 500, y: 250 }, 160, 80, nodes, nodes[0])).toEqual({
      x: nodes[0].position.x + 160,
      y: 250,
    });
  });

  /**
   * calculatePosition
   */
  it('calculatePosition(): should inherit the previous node position of same index if available', () => {
    const nodes = [
      { data: { label: 'aws-kinesis-source' }, id: 'dndnode_1', position: { x: 720, y: 250 } },
      { data: { label: 'avro-deserialize-sink' }, id: 'dndnode_2', position: { x: 880, y: 250 } },
    ];
    const nodeWidth = 80;

    expect(calculatePosition(0, { x: 500, y: 250 }, 160, nodeWidth, nodes)).toEqual({
      x: 720,
      y: 250,
    });

    expect(calculatePosition(1, { x: 500, y: 250 }, 160, nodeWidth, nodes)).toEqual({
      x: 880,
      y: 250,
    });
  });

  /**
   * containsAddStepPlaceholder
   */
  it('containsAddStepPlaceholder(): should determine if there is an ADD STEP placeholder in the steps', () => {
    const nodes = [
      { data: { label: 'ADD A STEP' }, id: 'dndnode_1', position: { x: 500, y: 250 } },
      { data: { label: 'avro-deserialize-sink' }, id: 'dndnode_2', position: { x: 660, y: 250 } },
    ];

    expect(containsAddStepPlaceholder(nodes)).toBe(true);

    expect(
      containsAddStepPlaceholder([
        { data: { label: 'avro-deserialize-sink' }, id: 'dndnode_2', position: { x: 660, y: 250 } },
      ])
    ).toBe(false);
  });

  /**
   * findStepIdxWithUUID
   */
  it("findStepIdxWithUUID(): should find a step's index, given a particular UUID", () => {
    expect(findStepIdxWithUUID('2caffeine-action', steps)).toEqual(2);
  });

  /**
   * getNextStep
   */
  it('getNextStep(): should get the next step', () => {
    expect(
      getNextStep(
        [
          { data: { label: 'aws-kinesis-source' }, id: 'dndnode_1', position: { x: 720, y: 250 } },
          {
            data: { label: 'avro-deserialize-sink' },
            id: 'dndnode_2',
            position: { x: 880, y: 250 },
          },
        ],
        { data: { label: 'aws-kinesis-source' }, id: 'dndnode_1', position: { x: 720, y: 250 } }
      )
    ).toEqual({
      data: { label: 'avro-deserialize-sink' },
      id: 'dndnode_2',
      position: { x: 880, y: 250 },
    });
  });

  it.skip('getRandomArbitraryNumber(): should get a random arbitrary number', () => {
    const mGetRandomValues = jest.fn().mockReturnValueOnce(new Uint32Array(10));

    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: mGetRandomValues },
    });

    expect(getRandomArbitraryNumber()).toEqual(new Uint32Array(10));
    expect(mGetRandomValues).toBeCalledWith(new Uint8Array(1));
  });

  /**
   * insertAddStepPlaceholder
   */
  it('insertAddStepPlaceholder(): should add an ADD STEP placeholder to the beginning of the array', () => {
    const nodes: IVizStepNode[] = [];
    insertAddStepPlaceholder(nodes);
    expect(nodes).toHaveLength(1);
  });

  /**
   * insertBranchGroupNode
   */
  it.skip('insertBranchGroupNode', () => {
    const nodes: IVizStepNode[] = [];
    insertBranchGroupNode(nodes, { x: 0, y: 0 }, 150, groupWidth);
    expect(nodes).toHaveLength(1);
  });

  /**
   * isFirstStepEip
   */
  it('isFirstStepEip(): should determine if the provided step is an EIP', () => {
    const firstBranch = eipIntegration[1].branches![0];
    expect(isFirstStepEip(eipIntegration)).toBe(false);
    expect(isFirstStepEip(firstBranch.steps)).toBe(true);
  });

  /**
   * isFirstStepStart
   */
  it('isFirstStepStart(): should determine if the first step is a START', () => {
    // first step is a START
    expect(isFirstStepStart(steps)).toBe(true);

    expect(
      isFirstStepStart([
        {
          id: 'pdf-action',
          name: 'pdf-action',
          type: 'MIDDLE',
          UUID: '1pdf-action',
          description: 'Create a PDF',
          group: 'PDF',
          icon: 'data:image/svg+xml;base64',
          kind: 'Kamelet',
          maxBranches: 0,
          minBranches: 0,
          parameters: [],
          title: 'PDF Action',
        },
      ])
    ).toBe(false);
  });

  /**
   * isLastNode
   */
  it('isLastNode(): should determine if the provided node is the last one, given an array of nodes', () => {
    const firstBranch = eipIntegration[1].branches![0];
    // the first step is just a normal Camel-Connector
    expect(isFirstStepEip(eipIntegration)).toBe(false);
    expect(isFirstStepEip(firstBranch.steps)).toBe(true);
  });

  /**
   * isEipStep
   */
  it('isEipStep(): should determine if the provided step is an EIP step', () => {
    const firstStep = eipIntegration[0];
    const secondBranchOfSecondStep = eipIntegration[1].branches![1];

    expect(isEipStep(firstStep)).toBe(false);
    expect(isEipStep(secondBranchOfSecondStep.steps[1])).toBe(true);
  });

  /**
   * isEndStep
   */
  it('isEndStep(): should determine if the provided step is an END step', () => {
    expect(isEndStep(eipIntegration[3])).toBe(true);
    expect(isEndStep(eipIntegration[0])).toBe(false);
  });

  /**
   * isMiddleStep
   */
  it('isMiddleStep(): should determine if the provided step is a MIDDLE step', () => {
    expect(isMiddleStep(eipIntegration[1])).toBe(true);
    expect(isMiddleStep(eipIntegration[0])).toBe(false);
  });

  /**
   * isStartStep
   */
  it('isStartStep(): should determine if the provided step is a START step', () => {
    expect(isStartStep(eipIntegration[0])).toBe(true);
    expect(isStartStep(eipIntegration[1])).toBe(false);
  });

  /**
   * regenerateUuids
   */
  it('regenerateUuids(): should regenerate UUIDs for an array of steps', () => {
    expect(regenerateUuids(steps)[0].UUID).toBeDefined();
    expect(regenerateUuids(branchSteps)[0].UUID).toBeDefined();
    expect(regenerateUuids(branchSteps)[1].UUID).toBeDefined();
  });
});
