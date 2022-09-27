import eipIntegration from '../store/data/branchSteps';
import importedSteps from '../store/data/steps';
import {
  calculatePosition,
  containsAddStepPlaceholder,
  findStepIdxWithUUID,
  getNextStep,
  insertAddStepPlaceholder,
  isEndStep,
  isFirstStepEip,
  isFirstStepStart,
  isMiddleStep,
  isStartStep,
} from './visualizationService';
import { IVizStepPropsNode } from '@kaoto/types';

describe('visualizationService', () => {
  /**
   * buildBranchStepNodes
   */
  it('should build nodes for an array of branch steps', () => {});

  /**
   * buildEdge
   */
  it('should build an edge for a single given node', () => {});

  /**
   * buildEdges
   */
  it('should build an edge for every node except the first, given an array of nodes', () => {});

  /**
   * buildNodeDefaultParams
   */
  it('should build the default parameters for a single node, given a step', () => {});

  /**
   * buildNodesFromSteps
   */
  it('should build visualization nodes from an array of steps', () => {});

  /**
   * calculatePosition
   */
  it('should calculate the very first position of a node', () => {
    // no previous step provided, use coordinates for first step provided
    expect(calculatePosition(0, [], { x: 500, y: 250 }, 160)).toEqual({
      x: 500,
      y: 250,
    });
  });

  /**
   * calculatePosition
   */
  it('should increment the position when a previous step is provided', () => {
    const nodes = [
      { data: { label: 'aws-kinesis-source' }, id: 'dndnode_1', position: { x: 720, y: 250 } },
    ];
    const customIncrementXAmt = 160;

    // should increment from previous step, and will not inherit any position,
    // as there is no existing node with the same index
    expect(calculatePosition(1, nodes, { x: 500, y: 250 }, customIncrementXAmt, nodes[0])).toEqual({
      x: nodes[0].position.x + customIncrementXAmt,
      y: 250,
    });
  });

  /**
   * calculatePosition
   */
  it('should inherit the previous node position of same index if available', () => {
    const nodes = [
      { data: { label: 'aws-kinesis-source' }, id: 'dndnode_1', position: { x: 720, y: 250 } },
      { data: { label: 'avro-deserialize-sink' }, id: 'dndnode_2', position: { x: 880, y: 250 } },
    ];

    expect(calculatePosition(0, nodes, { x: 500, y: 250 }, 160)).toEqual({
      x: 720,
      y: 250,
    });

    expect(calculatePosition(1, nodes, { x: 500, y: 250 }, 160)).toEqual({
      x: 880,
      y: 250,
    });
  });

  /**
   * containsAddStepPlaceholder
   */
  it('should determine if there is an ADD STEP placeholder in the steps', () => {
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
  it("should find a step's index, given a particular UUID", () => {
    expect(findStepIdxWithUUID('2caffeine-action', importedSteps)).toEqual(2);
  });

  /**
   * getNextStep
   */
  it('should get the next step', () => {
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

  /**
   * insertAddStepPlaceholder
   */
  it('should add an ADD STEP placeholder to the beginning of the array', () => {
    const nodes: IVizStepPropsNode[] = [];
    insertAddStepPlaceholder(nodes);
    expect(nodes).toHaveLength(1);
  });

  /**
   * isFirstStepEip
   */
  it('should determine if the provided step is an EIP', () => {
    const firstBranch = eipIntegration[1].branches![0];
    expect(isFirstStepEip(eipIntegration)).toBe(false);
    expect(isFirstStepEip(firstBranch.steps)).toBe(true);
  });

  /**
   * isFirstStepStart
   */
  it('should determine if the first step is a START', () => {
    // first step is a START
    expect(isFirstStepStart(importedSteps)).toBe(true);

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
          parameters: [],
          title: 'PDF Action',
        },
      ])
    ).toBe(false);
  });

  /**
   * isLastNode
   */
  it('should determine if the provided node is the last one, given an array of nodes', () => {
    const firstBranch = eipIntegration[1].branches![0];
    // the first step is just a normal Camel-Connector
    expect(isFirstStepEip(eipIntegration)).toBe(false);
    expect(isFirstStepEip(firstBranch.steps)).toBe(true);
  });

  /**
   * isEndStep
   */
  it('should determine if the provided step is of `type="END"`', () => {
    expect(isEndStep(eipIntegration[3])).toBe(true);
    expect(isEndStep(eipIntegration[0])).toBe(false);
  });

  /**
   * isMiddleStep
   */
  it('should determine if the provided step is of `type="MIDDLE"`', () => {
    expect(isMiddleStep(eipIntegration[1])).toBe(true);
    expect(isMiddleStep(eipIntegration[0])).toBe(false);
  });

  /**
   * isStartStep
   */
  it('should determine if the provided step is of `type="START"`', () => {
    expect(isStartStep(eipIntegration[0])).toBe(true);
    expect(isStartStep(eipIntegration[1])).toBe(false);
  });
});
