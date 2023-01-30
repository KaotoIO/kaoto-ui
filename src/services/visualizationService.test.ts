import eipIntegration from '../store/data/branchSteps';
import branchSteps from '../store/data/branchSteps';
import nestedBranch from '../store/data/kamelet.nested-branch.steps';
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
  extractNestedSteps,
  filterNestedSteps,
  filterStepWithBranches,
  findNodeIdxWithUUID,
  findStepIdxWithUUID,
  flattenSteps,
  getRandomArbitraryNumber,
  insertAddStepPlaceholder,
  insertBranchGroupNode,
  insertStep,
  isEndStep,
  isFirstStepEip,
  isFirstStepStart,
  isMiddleStep,
  isStartStep,
  prependStep,
  regenerateUuids,
  shouldAddEdge,
} from './visualizationService';
import { IStepProps, IVizStepNode } from '@kaoto/types';
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
   * extractNestedSteps
   */
  it('extractNestedSteps(): should create an array of properties for all nested steps', () => {
    const nested = nestedBranch.slice();
    expect(extractNestedSteps(nested)).toHaveLength(6);
  });

  /**
   * filterNestedSteps
   */
  it('filterNestedSteps(): should filter an array of steps given a conditional function', () => {
    const nestedSteps = [
      { branches: [{ steps: [{ branches: [{ steps: [{ UUID: 'log-340230' }] }] }] }] },
    ] as IStepProps[];
    expect(nestedSteps[0].branches![0].steps[0].branches![0].steps).toHaveLength(1);

    const filtered = filterNestedSteps(nestedSteps, (step) => step.UUID !== 'log-340230');
    expect(filtered![0].branches![0].steps[0].branches![0].steps).toHaveLength(0);
  });

  /**
   * filterStepWithBranches
   */
  it('filterStepWithBranches(): should filter the branch steps for a given step and conditional', () => {
    const step = {
      branches: [
        {
          steps: [
            {
              UUID: 'step-one',
              branches: [{ steps: [{ UUID: 'strawberry' }, { UUID: 'banana' }] }],
            },
            { UUID: 'step-two', branches: [{ steps: [{ UUID: 'cherry' }] }] },
          ],
        },
      ],
    } as IStepProps;

    expect(step.branches![0].steps[0].branches![0].steps).toHaveLength(2);

    const filtered = filterStepWithBranches(
      step,
      (step: { UUID: string }) => step.UUID !== 'banana'
    );

    expect(filtered.branches![0].steps[0].branches![0].steps).toHaveLength(1);
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

  /**
   * flattenSteps
   */
  it('flattenSteps(): should flatten an array of deeply nested steps', () => {
    expect(nestedBranch).toHaveLength(4);
    const deeplyNestedBranchStepUuid = 'set-body-877932';
    expect(nestedBranch.some((s) => s.UUID === deeplyNestedBranchStepUuid)).toBeFalsy();

    const flattenedSteps = flattenSteps(nestedBranch);
    expect(flattenedSteps).toHaveLength(10);
    expect(flattenedSteps.some((s) => s.UUID === deeplyNestedBranchStepUuid)).toBeTruthy();
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
   * insertStep
   */
  it('insertStep(): should insert the provided step at the index specified, in a given array of steps', () => {
    const steps = [
      {
        name: 'strawberry',
      },
      {
        name: 'blueberry',
      },
    ] as IStepProps[];

    expect(insertStep(steps, 2, { name: 'peach' } as IStepProps)).toHaveLength(3);
    // does it insert it at the correct spot?
    expect(insertStep(steps, 2, { name: 'peach' } as IStepProps)[2]).toEqual({ name: 'peach' });
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
          group: 'PDF',
          kind: 'Kamelet',
          title: 'PDF Action',
        } as IStepProps,
      ])
    ).toBe(false);
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
   * prependStep
   */
  it('prependStep(): should insert the provided step at the beginning of a given array of steps', () => {
    const steps = [
      {
        name: 'strawberry',
      },
      {
        name: 'blueberry',
      },
    ] as IStepProps[];

    expect(prependStep(steps, { name: 'peach' } as IStepProps)).toHaveLength(3);
    expect(prependStep(steps, { name: 'mango' } as IStepProps)[0]).toEqual({ name: 'mango' });
  });

  /**
   * regenerateUuids
   */
  it('regenerateUuids(): should regenerate UUIDs for an array of steps', () => {
    expect(regenerateUuids(steps)[0].UUID).toBeDefined();
    expect(regenerateUuids(branchSteps)[0].UUID).toBeDefined();
    expect(regenerateUuids(branchSteps)[1].UUID).toBeDefined();
  });

  /**
   * shouldAddEdge
   */
  it('shouldAddEdge(): given a node, should determine whether to add an edge for it', () => {
    const nodeWithoutBranches = {
      id: 'node-without-branches',
      data: { label: '', step: { UUID: '' } },
    } as IVizStepNode;

    const nextNode = {
      id: 'next-node',
      data: {
        label: 'Next Node',
        step: { UUID: '' },
      },
    } as IVizStepNode;

    // there is no next node, so it should be false
    expect(shouldAddEdge(nodeWithoutBranches)).toBeFalsy();
    expect(shouldAddEdge(nodeWithoutBranches, nextNode)).toBeTruthy();

    const nodeWithBranches = {
      id: 'node-with-branches',
      data: {
        step: {
          branches: [
            {
              identifier: 'branch-1',
              steps: [{ UUID: 'abcd', name: 'abcd' }],
            },
            {
              identifier: 'branch-2',
              steps: [{ UUID: 'efgh', name: 'efgh' }],
            },
          ],
        },
      },
    } as IVizStepNode;

    // there is no next node, so it should be false
    expect(shouldAddEdge(nodeWithBranches)).toBeFalsy();

    // it has branches with steps, so it should be false because
    // the steps will connect with the next step later on
    expect(shouldAddEdge(nodeWithBranches, nextNode)).toBeFalsy();

    const nodeWithEmptyBranch = {
      id: 'node-with-empty-branch',
      data: {
        step: {
          branches: [
            {
              identifier: 'branch-1',
              steps: [],
            },
            {
              identifier: 'branch-2',
              steps: [],
            },
          ],
        },
      },
    } as IVizStepNode;

    // there is no next node, so it should be false
    expect(shouldAddEdge(nodeWithEmptyBranch)).toBeFalsy();
    expect(shouldAddEdge(nodeWithoutBranches, nextNode)).toBeTruthy();
  });
});
