import { useFlowsStore } from '../store/FlowsStore';
import branchSteps from '../store/data/branchSteps';
import nodes from '../store/data/nodes';
import steps from '../store/data/steps';
import { useVisualizationStore } from '../store/visualizationStore';
import { FlowsService } from './FlowsService';
import { VisualizationService } from './visualizationService';
import {
  IStepProps,
  IStepPropsBranch,
  IVizStepNode,
  IVizStepNodeData,
  IVizStepNodeDataBranch,
  IVizStepPropsEdge,
} from '@kaoto/types';
import { truncateString } from '@kaoto/utils';
import { Position } from 'reactflow';

describe('visualizationService', () => {
  const groupWidth = 80;
  const baseStep = {
    UUID: '',
    name: '',
    maxBranches: 0,
    minBranches: 0,
    type: '',
    integrationId: 'Camel Route-1',
  };
  let service: VisualizationService;

  beforeEach(() => {
    service = new VisualizationService();

    useFlowsStore.setState({
      flows: [{ ...FlowsService.getNewFlow('Camel Route'), id: 'Camel Route-1' }],
    });
  });

  it('buildBranchNodeParams(): should build params for a branch node', () => {
    const currentStep = steps[3];
    const nodeId = 'node_example-1234';

    expect(VisualizationService.buildBranchNodeParams(currentStep, nodeId, 'RIGHT')).toEqual({
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
    expect(VisualizationService.buildBranchNodeParams(currentStep, nodeId, 'DOWN')).toEqual({
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

  describe('buildBranchSingleStepEdges()', () => {
    it('should build edges before and after a branch with only one step', () => {
      const node = {
        data: {
          step: {
            branches: [
              {
                steps: [{ UUID: 'single-step' }],
              },
            ],
          },
        },
      } as IVizStepNode;
      const rootNode = { data: { step: {} } } as IVizStepNode;
      const rootNodeNext = { data: { step: {} } } as IVizStepNode;
      expect(
        VisualizationService.buildBranchSingleStepEdges(node, rootNode, rootNodeNext),
      ).toHaveLength(2);
    });

    it('should use edgeType if exists', () => {
      const node = {
        data: {
          step: {
            branches: [
              {
                steps: [{ UUID: 'single-step' }],
              },
            ],
          },
        },
      } as IVizStepNode;
      const rootNode = { data: { step: {} } } as IVizStepNode;
      const rootNodeNext = { data: { step: {} } } as IVizStepNode;

      expect(
        VisualizationService.buildBranchSingleStepEdges(
          node,
          rootNode,
          rootNodeNext,
          'CUSTOM-NODE',
        ),
      ).toHaveLength(2);
    });

    it('should use branchIdentifier as label if exists', () => {
      const node = {
        data: {
          branchInfo: {
            branchIdentifier: 'This is a fixed branch identifier',
          },
          step: {
            branches: [
              {
                steps: [{ UUID: 'single-step' }],
              },
            ],
          },
        },
      } as IVizStepNode;
      const rootNode = { data: { step: {} } } as IVizStepNode;
      const rootNodeNext = { data: { step: {} } } as IVizStepNode;

      expect(
        VisualizationService.buildBranchSingleStepEdges(node, rootNode, rootNodeNext),
      ).toHaveLength(2);
    });
  });

  it("buildEdgeParams(): should build an edge's default parameters for a single given node", () => {
    const currentStep = nodes[1];
    const previousStep = nodes[0];

    expect(VisualizationService.buildEdgeParams(currentStep, previousStep).type).toEqual('default');
  });

  it('buildEdges(): should build an edge for every node except the first, given an array of nodes', () => {
    const nodes: IVizStepNode[] = [
      {
        data: {
          label: 'aws-kinesis-source',
          step: { ...baseStep, UUID: 'example-1234', integrationId: 'Camel Route-1' },
          nextStepUuid: 'example-1235',
        },
        id: 'dndnode_1',
        position: { x: 720, y: 250 },
      },
      {
        data: {
          label: 'avro-deserialize-sink',
          step: { ...baseStep, UUID: 'example-1235', integrationId: 'Camel Route-1' },
        },
        id: 'dndnode_2',
        position: { x: 880, y: 250 },
      },
    ];

    expect(VisualizationService.buildEdges(nodes)).toHaveLength(1);

    // let's test that it works for branching too
    const stepNodes = VisualizationService.buildNodesFromSteps(
      'Camel Route-1',
      branchSteps,
      'RIGHT',
    );

    expect(VisualizationService.buildEdges(stepNodes)).toHaveLength(branchSteps.length - 1);
  });

  it('buildNodeDefaultParams(): should build the default parameters for a single node, given a step', () => {
    const position = { x: 0, y: 0 };
    const step = { name: 'avro-deserialize-action', icon: '', kind: 'Kamelet' } as IStepProps;

    expect(VisualizationService.buildNodeDefaultParams(step, 'dummy-id', position)).toEqual({
      data: {
        branchInfo: undefined,
        icon: step.icon,
        isPlaceholder: false,
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

  describe('buildNodesFromSteps()', () => {
    it('should build visualization nodes from an array of steps', () => {
      const stepNodes = VisualizationService.buildNodesFromSteps('Camel Route-1', steps, 'RIGHT');
      expect(stepNodes[0].data.step.UUID).toBeDefined();
      expect(stepNodes[0].id).toContain(stepNodes[0].data.step.UUID);
    });

    it('should build visualization nodes from an array of steps with branches', () => {
      const stepNodes = VisualizationService.buildNodesFromSteps(
        'Camel Route-1',
        branchSteps,
        'RIGHT',
      );
      expect(stepNodes[0].data.step.UUID).toBeDefined();
      expect(stepNodes).toHaveLength(11); // 4 Main steps + 7 branch steps
    });
  });

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

    expect(VisualizationService.containsAddStepPlaceholder(nodes)).toBe(true);

    expect(
      VisualizationService.containsAddStepPlaceholder([
        {
          data: {
            label: 'avro-deserialize-sink',
            step: baseStep,
          },
          id: 'dndnode_2',
          position: { x: 660, y: 250 },
        },
      ]),
    ).toBe(false);
  });

  it('findNodeIdxWithUUID(): should find a node from an array of nodes, given a UUID', () => {
    expect(VisualizationService.findNodeIdxWithUUID(nodes[0].data.step.UUID, nodes)).toBe(0);
    expect(VisualizationService.findNodeIdxWithUUID(nodes[1].data.step.UUID, nodes)).toBe(1);
  });

  it('getLayoutedElements(): given an array of nodes and edges, return them with the correct graph layout', () => {
    const nodes: IVizStepNode[] = [
      { data: { step: {} } } as IVizStepNode,
      { data: { step: {} } } as IVizStepNode,
    ];
    const edges: IVizStepPropsEdge[] = [
      {
        arrowHeadType: 'arrowclosed',
        id: 'some-id',
        markerEnd: { type: 'arrow', color: '', strokeWidth: 2 },
        style: { stroke: '', strokeWidth: 2 },
        source: 'one',
        target: 'two',
        type: 'insert',
      } as IVizStepPropsEdge,
    ];
    let direction: string = 'LR';

    return VisualizationService.getLayoutedElements(nodes, edges, direction).then((res) => {
      const { layoutedNodes, layoutedEdges } = res;

      expect(layoutedNodes).toEqual([
        {
          data: { step: {} },
          position: { x: 0, y: 0 },
          sourcePosition: 'right',
          targetPosition: 'left',
        },
        {
          data: { step: {} },
          position: { x: 0, y: 0 },
          sourcePosition: 'right',
          targetPosition: 'left',
        },
      ]);
      expect(layoutedEdges).toEqual([
        {
          arrowHeadType: 'arrowclosed',
          id: 'some-id',
          markerEnd: { type: 'arrow', color: '', strokeWidth: 2 },
          style: { stroke: '', strokeWidth: 2 },
          source: 'one',
          target: 'two',
          type: 'insert',
        },
      ]);
    });
  });

  describe('getDagreWeightedValues', () => {
    const isHorizontal = true;
    const node: IVizStepNode = {
      data: {
        step: steps[1],
        label: 'Black label',
      },
      id: 'random-id',
      position: { x: 0, y: 0 },
      draggable: false,
      sourcePosition: Position.Top,
      targetPosition: Position.Bottom,
      type: 'step',
    };

    it('should return minlen=2 when in horizontal mode and has more than one nested step', () => {
      const sourceNode = {
        ...node,
        data: { step: { ...steps[1], branches: [1, 2] } },
      } as IVizStepNode;
      const result = VisualizationService.getDagreWeightedValues(isHorizontal, sourceNode);

      expect(result).toMatchObject({
        minlen: 2,
      });
    });

    it('should return minlen=1 when in horizontal mode and has one nested step', () => {
      const sourceNode = {
        ...node,
        data: { step: { ...steps[1], branches: [1] } },
      } as IVizStepNode;
      const result = VisualizationService.getDagreWeightedValues(isHorizontal, sourceNode);

      expect(result).toMatchObject({
        minlen: 1,
      });
    });

    it('should return minlen=1 when in horizontal mode and has no nested step', () => {
      const sourceNode = { ...node, data: { step: { ...steps[1], branches: [] } } } as IVizStepNode;
      const result = VisualizationService.getDagreWeightedValues(isHorizontal, sourceNode);

      expect(result).toMatchObject({
        minlen: 1,
      });
    });

    it('should return minlen=1 when in horizontal mode and has no branch info', () => {
      const sourceNode = {
        ...node,
        data: { step: { ...steps[1], branches: null } },
      } as IVizStepNode;
      const result = VisualizationService.getDagreWeightedValues(isHorizontal, sourceNode);

      expect(result).toMatchObject({
        minlen: 1,
      });
    });

    it('should return minlen=1.5 when in vertical mode', () => {
      const sourceNode = { ...node, data: { step: { ...steps[1], branches: [] } } } as IVizStepNode;
      const result = VisualizationService.getDagreWeightedValues(!isHorizontal, sourceNode);

      expect(result).toMatchObject({
        minlen: 1.5,
      });
    });

    it('should return weight=2 for steps with nested steps', () => {
      const sourceNode = {
        ...node,
        data: { step: { ...steps[1], branches: [1, 2, 3] } },
      } as IVizStepNode;
      const result = VisualizationService.getDagreWeightedValues(isHorizontal, sourceNode);

      expect(result).toMatchObject({
        weight: 2,
      });
    });

    it('should return weight=1 for steps without nested steps', () => {
      const sourceNode = { ...node, data: { step: { ...steps[1], branches: [] } } } as IVizStepNode;
      const result = VisualizationService.getDagreWeightedValues(isHorizontal, sourceNode);

      expect(result).toMatchObject({
        weight: 1,
      });
    });

    it('should return weight=1 for steps without branches', () => {
      const sourceNode = {
        ...node,
        data: { step: { ...steps[1], branches: null } },
      } as IVizStepNode;
      const result = VisualizationService.getDagreWeightedValues(isHorizontal, sourceNode);

      expect(result).toMatchObject({
        weight: 1,
      });
    });
  });

  it('getNodeClass(): given two strings to compare and a class name, returns the class name if they match', () => {
    const something = 'something';
    const nothing = undefined;
    expect(VisualizationService.getNodeClass('example', 'example', ' stepNode__Hover')).toEqual(
      ' stepNode__Hover',
    );
    expect(
      VisualizationService.getNodeClass(something, nothing ?? 'example', ' stepNode__Hover'),
    ).toEqual('');
    expect(
      VisualizationService.getNodeClass(something, nothing ?? something, ' stepNode__Hover'),
    ).toEqual(' stepNode__Hover');
  });

  it('insertAddStepPlaceholder(): should add an ADD STEP placeholder to the beginning of the array', () => {
    const nodes: IVizStepNode[] = [];
    VisualizationService.insertAddStepPlaceholder('Camel Route-1', nodes, '', 'START', {
      nextStepUuid: '',
    });
    expect(nodes).toHaveLength(1);
  });

  it('insertBranchGroupNode', () => {
    const nodes: IVizStepNode[] = [];
    VisualizationService.insertBranchGroupNode(nodes, { x: 0, y: 0 }, 150, groupWidth);
    expect(nodes).toHaveLength(1);
  });

  it('isFirstAndOnlyNode()', () => {
    const nodeData: IVizStepNodeData = { label: '', step: {} as IStepProps };
    expect(VisualizationService.isFirstAndOnlyNode(nodeData)).toBeTruthy();
    expect(
      VisualizationService.isFirstAndOnlyNode({
        ...nodeData,
        branchInfo: {} as IVizStepNodeDataBranch,
        nextStepUuid: 'some-next-step',
        previousStepUuid: 'some-previous-step',
      }),
    ).toBeFalsy();
  });

  describe('redrawDiagram', () => {
    beforeEach(() => {
      jest.spyOn(FlowsService, 'getNewFlowId').mockReturnValueOnce('route-1234');
      jest.spyOn(FlowsService, 'getNewFlowId').mockReturnValueOnce('route-4321');
    });

    it('should process only visible flows', async () => {
      useFlowsStore.getState().addNewFlow('Integration');
      useFlowsStore.getState().addNewFlow('Integration');

      const getLayoutedElementsSpy = jest.spyOn(VisualizationService, 'getLayoutedElements');

      await service.redrawDiagram(jest.fn());

      expect(getLayoutedElementsSpy).toHaveBeenCalledTimes(1);
      expect(getLayoutedElementsSpy).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            data: {
              isPlaceholder: true,
              label: 'ADD A STEP',
              nextStepUuid: undefined,
              step: {
                UUID: expect.stringMatching(/placeholder-\d+/),
                integrationId: 'route-4321',
                name: '',
                type: 'START',
              },
            },
            draggable: false,
            height: 80,
            id: expect.stringMatching(/node_0--\d+/),
            position: {
              x: 0,
              y: 0,
            },
            sourcePosition: 'right',
            targetPosition: 'left',
            type: 'step',
            width: 80,
          }),
        ],
        [],
        'LR',
      );
    });

    it('should process more than one visible flow', async () => {
      useFlowsStore.getState().addNewFlow('Integration');
      useFlowsStore.getState().addNewFlow('Integration');
      useVisualizationStore.getState().showAllFlows();

      const getLayoutedElementsSpy = jest.spyOn(VisualizationService, 'getLayoutedElements');

      await service.redrawDiagram(jest.fn());

      expect(getLayoutedElementsSpy).toHaveBeenCalledTimes(1);
      expect(getLayoutedElementsSpy).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            data: {
              isPlaceholder: true,
              label: 'ADD A STEP',
              nextStepUuid: undefined,
              step: {
                UUID: expect.stringMatching(/placeholder-\d+/),
                integrationId: 'route-1234',
                name: '',
                type: 'START',
              },
            },
            draggable: false,
            height: 80,
            id: expect.stringMatching(/node_0--\d+/),
            position: {
              x: 0,
              y: 0,
            },
            sourcePosition: 'right',
            targetPosition: 'left',
            type: 'step',
            width: 80,
          }),
          expect.objectContaining({
            data: {
              isPlaceholder: true,
              label: 'ADD A STEP',
              nextStepUuid: undefined,
              step: {
                UUID: expect.stringMatching(/placeholder-\d+/),
                integrationId: 'route-4321',
                name: '',
                type: 'START',
              },
            },
            draggable: false,
            height: 80,
            id: expect.stringMatching(/node_0--\d+/),
            position: {
              x: 0,
              y: expect.any(Number),
            },
            sourcePosition: 'right',
            targetPosition: 'left',
            type: 'step',
            width: 80,
          }),
        ],
        [],
        'LR',
      );
    });
  });

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
    expect(VisualizationService.shouldAddEdge(nodeWithoutBranches)).toBeFalsy();
    expect(VisualizationService.shouldAddEdge(nodeWithoutBranches, nextNode)).toBeTruthy();

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
    expect(VisualizationService.shouldAddEdge(nodeWithBranches)).toBeFalsy();

    // it has branches with steps, so it should be false because
    // the steps will connect with the next step later on
    expect(VisualizationService.shouldAddEdge(nodeWithBranches, nextNode)).toBeFalsy();

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
    expect(VisualizationService.shouldAddEdge(nodeWithEmptyBranch)).toBeFalsy();
    expect(VisualizationService.shouldAddEdge(nodeWithoutBranches, nextNode)).toBeTruthy();
  });

  it('showAppendStepButton(): given a node, should determine whether to show an append step button for it', () => {
    // it cannot be an END step, it must be the last step in the array,
    // OR it must support branching & contain at least one step
    const stepWithNoBranch: IVizStepNodeData = {
      label: '',
      isLastStep: true,
      step: {} as IStepProps,
    };

    // is the last step, is an end step, no branching support
    expect(VisualizationService.showAppendStepButton(stepWithNoBranch, true)).toBeFalsy();

    // is the last step, is not an end step, no branching support
    expect(VisualizationService.showAppendStepButton(stepWithNoBranch, false)).toBeTruthy();

    const lastStepWithBranch: IVizStepNodeData = {
      label: '',
      isLastStep: true,
      step: {
        branches: [{}] as IStepPropsBranch[],
        maxBranches: -1,
        minBranches: 0,
      } as IStepProps,
    };

    // is last step, is an end step, supports branching
    expect(VisualizationService.showAppendStepButton(lastStepWithBranch, true)).toBeTruthy();

    // is last step, is not an end step, supports branching
    expect(VisualizationService.showAppendStepButton(lastStepWithBranch, false)).toBeTruthy();

    // is not the last step, is not an end step, supports branching
    expect(
      VisualizationService.showAppendStepButton(
        {
          ...lastStepWithBranch,
          isLastStep: false,
        },
        false,
      ),
    ).toBeTruthy();

    // a trick step at the end of an array, an END step, with a branches array but no min/max branching.
    // NOTE: this is unlikely to happen, but added for catching edge cases
    expect(
      VisualizationService.showAppendStepButton(
        { isLastStep: true, step: { branches: [{}] as IStepPropsBranch[] } } as IVizStepNodeData,
        true,
      ),
    ).toBeFalsy();
  });

  it('showPrependStepButton(): given a node, should determine whether to show a prepend step button for it', () => {
    const vizStoreState = useVisualizationStore.getState();
    useVisualizationStore.setState({
      nodes: [
        ...vizStoreState.nodes,
        {
          data: {
            isFirstStep: true,
            step: { branches: [{}], UUID: 'step-one' } as IStepProps,
          },
        } as IVizStepNode,
        {
          data: {
            isFirstStep: false,
            step: { UUID: 'step-two' } as IStepProps,
          },
        } as IVizStepNode,
      ],
    });
    const visualizationService = new VisualizationService();

    // it cannot be an end step, and it must be a first step
    const node: IVizStepNodeData = {
      label: '',
      isFirstStep: true,
      step: {} as IStepProps,
    };

    // is a first step, is an end step
    expect(
      visualizationService.showPrependStepButton({ ...node, step: { ...node.step, type: 'END' } }),
    ).toBeFalsy();

    // is a first step, is not an end step
    expect(
      visualizationService.showPrependStepButton({
        ...node,
        step: { ...node.step, type: 'MIDDLE' },
      }),
    ).toBeTruthy();

    // is not a first step, is not an end step
    expect(
      visualizationService.showPrependStepButton({
        ...node,
        step: { ...node.step, type: 'MIDDLE' },
        isFirstStep: false,
      }),
    ).toBeFalsy();

    // is not a first step, is an end step
    expect(
      visualizationService.showPrependStepButton({
        ...node,
        step: { ...node.step, type: 'END' },
        isFirstStep: false,
      }),
    ).toBeFalsy();

    // current step is NOT an end step, but its previous step contains a branch
    expect(
      visualizationService.showPrependStepButton({
        label: '',
        isFirstStep: false,
        previousStepUuid: 'step-one',
        step: { ...node.step, type: 'MIDDLE' } as IStepProps,
      }),
    ).toBeTruthy();
  });

  it('showBranchesTab(): given node data, should determine whether to show the branches tab in mini catalog', () => {
    const step = {} as IStepProps;

    expect(VisualizationService.showBranchesTab(step)).toBeFalsy();
    // has branches but not branch support
    expect(
      VisualizationService.showBranchesTab({
        ...step,
        branches: [],
      }),
    ).toBeFalsy();

    expect(
      VisualizationService.showBranchesTab({
        ...step,
        branches: [],
        minBranches: 0,
        maxBranches: -1,
      }),
    ).toBeTruthy();

    // if step has maximum number of branches already
    expect(
      VisualizationService.showBranchesTab({
        ...step,
        branches: [{}, {}] as IStepPropsBranch[],
        minBranches: 0,
        maxBranches: 2,
      }),
    ).toBeFalsy();
  });

  it('showStepsTab(): given node data, should determine whether to show the steps tab in mini catalog', () => {
    const step: IVizStepNodeData = {
      label: '',
      step: {} as IStepProps,
    };

    // contains no branches
    expect(VisualizationService.showStepsTab(step)).toBeTruthy();

    // contains branches, has no next step, should show steps tab
    expect(
      VisualizationService.showStepsTab({
        ...step,
        step: { ...step.step, branches: [{} as IStepPropsBranch] },
      }),
    ).toBeTruthy();

    // contains branches, has a next step, should not show steps tab
    expect(
      VisualizationService.showStepsTab({
        ...step,
        step: { ...step.step, branches: [{} as IStepPropsBranch] },
        nextStepUuid: 'some-dummy-node-uuid',
      }),
    ).toBeFalsy();
  });

  it('getEmptySelectedStep(): should allow consumers to get a static empty step', () => {
    const result = VisualizationService.getEmptySelectedStep();

    expect(result).toEqual({
      maxBranches: 0,
      minBranches: 0,
      name: '',
      type: '',
      UUID: '',
      integrationId: '',
    });
  });

  it('displaySingleFlow(): should display a single flow in the store', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1': true,
        'route-2': false,
      },
    });

    VisualizationService.displaySingleFlow('route-2');

    expect(useVisualizationStore.getState().visibleFlows).toEqual({
      'route-1': false,
      'route-2': true,
    });
  });

  it('deleteFlowFromVisibleFlows(): should delete a flow from the visible flows in the store', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1': true,
        'route-2': false,
      },
    });

    VisualizationService.deleteFlowFromVisibleFlows('route-1');

    expect(useVisualizationStore.getState().visibleFlows).toEqual({
      'route-2': false,
    });
  });

  it('renameVisibleFlow(): should rename a visible flow in the store', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1': true,
        'route-2': false,
      },
    });

    VisualizationService.renameVisibleFlow('route-1', 'route-1-renamed');

    expect(useVisualizationStore.getState().visibleFlows).toEqual({
      'route-1-renamed': true,
      'route-2': false,
    });
  });

  describe('setVisibleFlows()', () => {
    it('should set the visible flows in the store with the first one visible', () => {
      VisualizationService.setVisibleFlows(['route-1', 'route-2']);

      expect(useVisualizationStore.getState().visibleFlows).toEqual({
        'route-1': true,
        'route-2': false,
      });
    });

    it('should preserve the previous visible flows status', () => {
      useVisualizationStore.setState({
        visibleFlows: {
          'route-1': true,
          'route-2': true,
        },
      });

      VisualizationService.setVisibleFlows(['route-1', 'route-2']);

      expect(useVisualizationStore.getState().visibleFlows).toEqual({
        'route-1': true,
        'route-2': true,
      });
    });
  });

  it('removeAllVisibleFlows(): should remove all visible flows from the store', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1': true,
        'route-2': true,
      },
    });

    VisualizationService.removeAllVisibleFlows();

    expect(useVisualizationStore.getState().visibleFlows).toEqual({});
  });
});
