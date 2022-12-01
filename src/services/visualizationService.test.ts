import eipIntegration from '../store/data/branchSteps';
import branchSteps from '../store/data/branchSteps';
import nodes from '../store/data/nodes';
import steps from '../store/data/steps';
import {
  buildBranchNodeParams,
  buildEdgeParams,
  buildEdges,
  buildNodeDefaultParams,
  buildNodesFromSteps,
  containsAddStepPlaceholder,
  containsBranches,
  findNodeIdxWithUUID,
  findStepIdxWithUUID,
  getRandomArbitraryNumber,
  insertAddStepPlaceholder,
  insertBranchGroupNode,
  isEndStep,
  isFirstStepEip,
  isFirstStepStart,
  isMiddleStep,
  isStartStep,
  regenerateUuids,
} from './visualizationService';
import { IVizStepNode } from '@kaoto/types';
import { truncateString } from '@kaoto/utils';
import { MarkerType, Position } from 'reactflow';

describe('visualizationService', () => {
  const groupWidth = 80;
  const baseStep = { UUID: '', name: '', maxBranches: 0, minBranches: 0, type: '' };

  /**
   * buildBranchNodeParams
   */
  it('buildBranchNodeParams(): should build params for a branch node', () => {
    const currentStep = steps[3];
    const nodeId = 'node_example-1234';

    expect(buildBranchNodeParams(currentStep, nodeId, 'RIGHT')).toEqual({
      data: {
        kind: currentStep.kind,
        label: truncateString(currentStep.name, 14),
        step: currentStep,
        icon: currentStep.icon,
      },
      id: nodeId,
      position: { x: 0, y: 0 },
      draggable: false,
      sourcePosition: Position.Top,
      targetPosition: Position.Bottom,
      type: 'step',
    });

    // Check that the `sourcePosition` and `targetPosition` change with the layout
    expect(buildBranchNodeParams(currentStep, nodeId, 'DOWN')).toEqual({
      data: {
        kind: currentStep.kind,
        label: truncateString(currentStep.name, 14),
        step: currentStep,
        icon: currentStep.icon,
      },
      id: nodeId,
      position: { x: 0, y: 0 },
      draggable: false,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: 'step',
    });
  });

  /**
   * buildEdgeParams
   */
  it("buildEdgeParams(): should build an edge's default parameters for a single given node", () => {
    const currentStep = nodes[1];
    const previousStep = nodes[0];

    expect(buildEdgeParams(currentStep, previousStep)).toEqual({
      arrowHeadType: 'arrowclosed',
      id: 'e-' + currentStep.id + '>' + previousStep.id,
      markerEnd: {
        type: MarkerType.Arrow,
      },
      source: currentStep.id,
      target: previousStep.id,
      type: 'default',
    });
  });

  /**
   * buildEdges
   */
  it('buildEdges(): should build an edge for every node except the first, given an array of nodes', () => {
    const nodes = [
      {
        data: {
          label: 'aws-kinesis-source',
          step: { ...baseStep, UUID: 'example-1234' },
          nextStepUuid: 'example-1235',
        },
        id: 'dndnode_1',
        position: { x: 720, y: 250 },
      },
      {
        data: { label: 'avro-deserialize-sink', step: { ...baseStep, UUID: 'example-1235' } },
        id: 'dndnode_2',
        position: { x: 880, y: 250 },
      },
    ];

    expect(buildEdges(nodes)).toHaveLength(1);

    // let's test that it works for branching too
    const stepNodes = buildNodesFromSteps(branchSteps, 'RIGHT');

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
        x: 0,
        y: 0,
      },
      id: 'dummy-id',
      draggable: false,
      height: 80,
      position: { x: 0, y: 0 },
      type: 'step',
      width: 80,
      x: 0,
      y: 0,
    });
  });

  /**
   * buildNodesFromSteps
   */
  it('buildNodesFromSteps(): should build visualization nodes from an array of steps', () => {
    const stepNodes = buildNodesFromSteps(steps, 'RIGHT');
    expect(stepNodes[0].data.step.UUID).toBeDefined();
    expect(stepNodes[0].id).toContain(stepNodes[0].data.step.UUID);
  });

  /**
   * buildNodesFromSteps for integrations with branches
   */
  it.skip('buildNodesFromSteps(): should build visualization nodes from an array of steps with branches', () => {
    const stepNodes = buildNodesFromSteps(branchSteps, 'RIGHT');
    expect(stepNodes[0].data.step.UUID).toBeDefined();
    expect(stepNodes).toHaveLength(branchSteps.length);
  });

  /**
   * containsAddStepPlaceholder
   */
  it('containsAddStepPlaceholder(): should determine if there is an ADD STEP placeholder in the steps', () => {
    const nodes = [
      {
        data: {
          label: 'ADD A STEP',
          step: baseStep,
        },
        id: 'dndnode_1',
        position: { x: 500, y: 250 },
      },
      {
        data: {
          label: 'avro-deserialize-sink',
          step: baseStep,
        },
        id: 'dndnode_2',
        position: { x: 660, y: 250 },
      },
    ];

    expect(containsAddStepPlaceholder(nodes)).toBe(true);

    expect(
      containsAddStepPlaceholder([
        {
          data: {
            label: 'avro-deserialize-sink',
            step: baseStep,
          },
          id: 'dndnode_2',
          position: { x: 660, y: 250 },
        },
      ])
    ).toBe(false);
  });

  /**
   * containsBranches
   */
  it('containsBranches(): should determine if a given step contains branches', () => {
    expect(containsBranches(branchSteps[0])).toBe(false);
    expect(containsBranches(branchSteps[1])).toBe(true);
  });

  /**
   * findNodeIdxWithUUID
   */
  it('findNodeIdxWithUUID(): should find a node from an array of nodes, given a UUID', () => {
    expect(findNodeIdxWithUUID(nodes[0].data.step.UUID, nodes)).toBe(0);
    expect(findNodeIdxWithUUID(nodes[1].data.step.UUID, nodes)).toBe(1);
  });

  /**
   * findStepIdxWithUUID
   */
  it("findStepIdxWithUUID(): should find a step's index, given a particular UUID", () => {
    expect(findStepIdxWithUUID('caffeine-action-2', steps)).toEqual(2);
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
    insertAddStepPlaceholder(nodes, { id: '', nextStepUuid: '' });
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
          UUID: 'pdf-action-1',
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
