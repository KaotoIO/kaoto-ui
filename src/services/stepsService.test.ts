import branchSteps from '../store/data/branchSteps';
import deployment from '../store/data/deployment';
import nestedBranch from '../store/data/kamelet.nested-branch.steps';
import steps from '../store/data/steps';
import YAML from '../store/data/yaml';
import { flowWithBranch } from '../stubs';
import { FlowsService } from './FlowsService';
import { NestedStepsService } from './NestedStepsService';
import { StepsService } from './stepsService';
import {
  fetchDeployment,
  fetchStepDetails,
  fetchViews,
  startDeployment,
  stopDeployment,
} from '@kaoto/api';
import { useFlowsStore, useNestedStepsStore } from '@kaoto/store';
import {
  INestedStep,
  IStepProps,
  IStepPropsBranch,
  IStepPropsParameters,
  IViewProps,
  IVizStepNode,
  IVizStepNodeData,
} from '@kaoto/types';

jest.mock('@kaoto/api', () => {
  const actual = jest.requireActual('@kaoto/api');

  return {
    ...actual,
    fetchDeployment: jest.fn(),
    fetchStepDetails: jest.fn(),
    fetchViews: jest.fn(),
    startDeployment: jest.fn(),
    stopDeployment: jest.fn(),
  };
});

describe('stepsService', () => {
  const stepsService = new StepsService();
  const MOCK_FLOW_ID = 'route-1234';

  const step = {
    name: 'pineapple',
    parameters: [
      { title: 'Description', type: 'string', id: 'description', value: 'A fruit' },
    ] as IStepPropsParameters[],
  } as IStepProps;

  beforeEach(() => {
    useFlowsStore.getState().deleteAllFlows();

    jest.spyOn(FlowsService, 'getNewFlowId').mockReturnValueOnce(MOCK_FLOW_ID);
    useFlowsStore.getState().addNewFlow('Integration');
  });

  describe('addBranch()', () => {
    beforeEach(() => {
      useFlowsStore.setState({ flows: [flowWithBranch] });
    });
    const newBranch = {
      branchUuid: 'blueberry-branch-01',
      steps: [] as IStepProps[],
    } as IStepPropsBranch;

    it('should add a branch to the specified step from the store', () => {
      stepsService.addBranch(
        { ...flowWithBranch.steps[0], branches: undefined } as IStepProps,
        newBranch,
      );

      expect(useFlowsStore.getState().flows[0].steps[0].branches).toHaveLength(1);
    });

    it('should add another branch to the branches array', () => {
      stepsService.addBranch(
        { ...flowWithBranch.steps[0], branches: [newBranch] } as IStepProps,
        { branchUuid: 'blueberry-branch-02', steps: [] as IStepProps[] } as IStepPropsBranch,
      );

      expect(useFlowsStore.getState().flows[0].steps[0].branches).toHaveLength(2);
    });

    it('should update a nested step parameter', () => {
      useNestedStepsStore
        .getState()
        .updateSteps(NestedStepsService.extractNestedSteps(flowWithBranch.steps));

      const nestedLogStep = flowWithBranch.steps[1].branches![0].steps[0];
      stepsService.addBranch(nestedLogStep, {
        branchUuid: 'blueberry-branch-02',
        steps: [] as IStepProps[],
      } as IStepPropsBranch);

      const updatedBranchStep = StepsService.flattenSteps(flowWithBranch.steps).find(
        (step) => step.id === nestedLogStep.id,
      );

      expect(updatedBranchStep?.branches).toHaveLength(1);
    });
  });

  it('buildStepSchemaAndModel(): should ignore empty array parameter', () => {
    const parameter: IStepPropsParameters = {
      id: 'key',
      type: 'string',
      description: 'test description',
      value: 'value',
    };
    const parameter2: IStepPropsParameters = {
      id: 'array',
      type: 'array',
      description: '',
      value: [],
    };
    const parameter3: IStepPropsParameters = {
      id: 'array2',
      type: 'array',
      description: 'array',
      value: null,
    };
    const modelObjectRef = {} as IStepPropsParameters;
    const schemaObjectRef: {
      [label: string]: { type: string; value?: any; description?: string };
    } = {};

    StepsService.buildStepSchemaAndModel(parameter, modelObjectRef, schemaObjectRef);
    StepsService.buildStepSchemaAndModel(parameter2, modelObjectRef, schemaObjectRef);
    StepsService.buildStepSchemaAndModel(parameter3, modelObjectRef, schemaObjectRef);

    const modelEntries = Object.entries(modelObjectRef);
    const schemaEntries = Object.entries(schemaObjectRef);

    expect(schemaEntries.length).toBe(1);
    expect(modelEntries.length).toBe(1);

    expect(modelEntries[0][0]).toContain('key');
    expect(modelEntries[0][1]).toContain('value');

    expect(JSON.stringify(schemaEntries)).toContain('test description');
  });

  it('containsBranches(): should determine if a given step contains branches', () => {
    expect(StepsService.containsBranches(branchSteps[0])).toBe(false);
    expect(StepsService.containsBranches(branchSteps[1])).toBe(true);
  });

  describe('createKaotoApi(): should create an instance of IKaotoApi for step extensions to consume', () => {
    it('getDeployment(): should call apiService to return the current running deployment', async () => {
      jest.mocked(fetchDeployment).mockResolvedValueOnce(deployment);
      await stepsService
        .createKaotoApi(step, jest.fn(), jest.fn())
        .getDeployment('lexi')
        .then((res) => {
          expect(res).toEqual(deployment);
          expect(fetchDeployment).toHaveBeenCalled();
        });
    });

    it('notifyKaoto(): should call the provided callback to alert Kaoto', () => {
      const alertKaoto = jest.fn();
      stepsService.createKaotoApi(step, jest.fn(), alertKaoto).notifyKaoto('Dummy notification');
      expect(alertKaoto).toHaveBeenCalled();
    });

    it('startDeployment(): should call apiService to deploy the current source code (YAML) if valid', async () => {
      jest.mocked(startDeployment).mockResolvedValueOnce(YAML);
      await stepsService
        .createKaotoApi(step, jest.fn(), jest.fn())
        .startDeployment(YAML, 'Updated integration', 'default')
        .then(() => {
          expect(startDeployment).toHaveBeenCalled();
        });
    });

    it('step: should return the current step', () => {
      expect(stepsService.createKaotoApi(step, jest.fn(), jest.fn()).step).toMatchObject(step);
    });

    it('stepParams: should return the current step parameters', () => {
      expect(stepsService.createKaotoApi(step, jest.fn(), jest.fn()).stepParams).toMatchObject({
        description: 'A fruit',
      });
    });

    it('stopDeployment(): should call apiService to stop the current running deployment', async () => {
      jest.mocked(stopDeployment).mockResolvedValueOnce('Deployment stopped...');
      stepsService
        .createKaotoApi(step, jest.fn(), jest.fn())
        .stopDeployment('Updated integration', 'default');
      expect(stopDeployment).toHaveBeenCalled();
    });

    it('updateStep(): should delegate the update to updateStepParameters method', () => {
      const updateStepParametersSpy = jest
        .spyOn(stepsService, 'updateStepParameters')
        .mockImplementationOnce(() => {});

      stepsService
        .createKaotoApi(step, jest.fn(), jest.fn())
        .updateStep({ name: 'pineapple' } as IStepProps);

      expect(updateStepParametersSpy).toHaveBeenCalled();
    });

    it('updateStepParams(): should call the provided callback for updating step params', () => {
      const saveConfig = jest.fn();
      stepsService.createKaotoApi(step, saveConfig, jest.fn()).updateStepParams({ name: 'pizza' });
      expect(saveConfig).toHaveBeenCalled();
    });
  });

  describe('updateStepParameters()', () => {
    beforeEach(() => {
      useFlowsStore.getState().insertStep(MOCK_FLOW_ID, step, { mode: 'append' });
    });

    it.each([
      {},
      { description: 'This is an updated description' },
      { anotherProperty: 'This is another property' },
      { description: undefined },
      { description: null },
    ])('should not mutate the provided step "%s"', (newValues) => {
      stepsService.updateStepParameters(step, newValues);

      expect(step.parameters).toEqual([
        { title: 'Description', type: 'string', id: 'description', value: 'A fruit' },
      ]);
    });

    it.each([
      ['This is an updated description', 'This is an updated description'],
      [undefined, 'A fruit'],
      [null, 'A fruit'],
    ])('should update the provided step\'s parameters "%s"', (updatedValue, value) => {
      stepsService.updateStepParameters(step, { description: updatedValue });

      const updatedStep = useFlowsStore.getState().flows[0].steps[0];
      expect(updatedStep).toEqual({
        ...step,
        UUID: `${MOCK_FLOW_ID}_pineapple-0`,
        parameters: [
          {
            title: 'Description',
            type: 'string',
            id: 'description',
            value,
          },
        ],
      });
    });

    it("should ignore the provided step's parameters if they are not defined", () => {
      stepsService.updateStepParameters(
        { ...step, parameters: undefined },
        { description: 'A vegetable' },
      );

      const updatedStep = useFlowsStore.getState().flows[0].steps[0];
      expect(updatedStep).toEqual({
        ...step,
        UUID: `${MOCK_FLOW_ID}_pineapple-0`,
        parameters: undefined,
      });
    });

    it('should update a nested step parameter', () => {
      useFlowsStore.setState({
        flows: [flowWithBranch],
      });
      useNestedStepsStore
        .getState()
        .updateSteps(NestedStepsService.extractNestedSteps(flowWithBranch.steps));

      stepsService.updateStepParameters(
        // log step
        {
          ...flowWithBranch.steps[1].branches![0].steps[0],
          parameters: [
            { title: 'Message', type: 'string', id: 'message', value: 'An old message' },
          ],
        },
        {
          message: 'A new hope',
        },
      );

      const updatedStep = useFlowsStore.getState().flows[0].steps[1].branches![0].steps[0];

      expect(updatedStep).toMatchObject({
        parameters: [
          {
            title: 'Message',
            type: 'string',
            id: 'message',
            value: 'A new hope',
          },
        ],
      });
    });
  });

  it('deleteBranch(): should delete branch from specified step from the store', () => {
    const step = {
      UUID: 'peach',
      name: 'peach',
      branches: [
        { branchUuid: 'peach-0_branch-0', steps: [] as IStepProps[] } as IStepPropsBranch,
      ] as IStepPropsBranch[],
    } as IStepProps;

    useFlowsStore.setState({
      flows: [
        {
          ...useFlowsStore.getState().flows[0],
          steps: [step],
        },
      ],
    });

    expect(useFlowsStore.getState().flows[0].steps[0].branches).toHaveLength(1);

    stepsService.deleteBranch(MOCK_FLOW_ID, step, 'peach-0_branch-0');

    expect(useFlowsStore.getState().flows[0].steps[0].branches).toHaveLength(0);
  });

  it('deleteStep(): should delete specified step from the store', () => {
    useFlowsStore
      .getState()
      .insertStep(MOCK_FLOW_ID, { name: 'pineapple' } as IStepProps, { mode: 'append' });
    expect(useFlowsStore.getState().flows[0].steps).toHaveLength(1);

    useFlowsStore.getState().deleteStep(MOCK_FLOW_ID, `${MOCK_FLOW_ID}_pineapple-0`);
    expect(useFlowsStore.getState().flows[0].steps).toHaveLength(0);
  });

  it("findStepIdxWithUUID(): should find a step's index, given a particular UUID", () => {
    const steps = [
      { UUID: 'twitter-search-source-0' },
      { UUID: 'pdf-action-1' },
      { UUID: 'caffeine-action-2' },
    ] as IStepProps[];
    expect(stepsService.findStepIdxWithUUID('caffeine-action-2', steps)).toEqual(2);

    // passing it a nested branch's steps array
    const nestedSteps = steps.slice();
    nestedSteps.push({
      UUID: 'new-step-3',
      branches: [{ steps: [{ UUID: 'nested-step-0' }, { UUID: 'nested-step-1' }] }, {}],
    } as IStepProps);
    expect(
      stepsService.findStepIdxWithUUID('nested-step-1', nestedSteps[3].branches![0].steps),
    ).toEqual(1);

    // testing without explicitly passing a steps array
    useFlowsStore.setState({
      flows: [
        {
          ...useFlowsStore.getState().flows[0],
          steps,
        },
      ],
    });

    expect(stepsService.findStepIdxWithUUID('caffeine-action-2', steps)).toEqual(2);
  });

  describe('findStepWithUUID()', () => {
    it('should return "undefined" for a non existing integrationId', () => {
      useFlowsStore.setState({ flows: [flowWithBranch] });
      const step = stepsService.findStepWithUUID(
        'non-existing-integration-id',
        'route-1814_pipeline-1',
      );

      expect(step).toBeUndefined();
    });

    it('should return "undefined" for a non existing UUID', () => {
      useFlowsStore.setState({ flows: [flowWithBranch] });
      const step = stepsService.findStepWithUUID(
        'route-1814',
        'non-existing-uuid',
      );

      expect(step).toBeUndefined();
    });

    it('should return a step', () => {
      useFlowsStore.setState({ flows: [flowWithBranch] });
      const step = stepsService.findStepWithUUID(
        'route-1814',
        'route-1814_pipeline-1',
      );

      expect(step).toBeDefined();
      expect(step).toEqual(flowWithBranch.steps[1]);
    });

    it('should return a nested step', () => {
      useFlowsStore.setState({ flows: [flowWithBranch] });
      const step = stepsService.findStepWithUUID(
        'route-1814',
        'route-1814_pipeline-1_branch-0_log-0',
      );

      expect(step).toBeDefined();
      expect(step).toEqual(flowWithBranch.steps[1].branches![0].steps[0]);
    });
  });

  it('flattenSteps(): should flatten an array of deeply nested steps', () => {
    expect(nestedBranch).toHaveLength(4);
    const deeplyNestedBranchStepUuid = 'set-body-877932';
    expect(nestedBranch.some((s) => s.UUID === deeplyNestedBranchStepUuid)).toBeFalsy();

    const flattenedSteps = StepsService.flattenSteps(nestedBranch);
    expect(flattenedSteps).toHaveLength(10);
    expect(flattenedSteps.some((s) => s.UUID === deeplyNestedBranchStepUuid)).toBeTruthy();
  });

  it('getFollowingStep(): should return the step following the one provided', () => {
    const steps = [
      {
        UUID: 'one',
      } as IStepProps,
      {
        UUID: 'two',
      } as IStepProps,
      {
        UUID: 'three',
      } as IStepProps,
    ];

    useFlowsStore.setState({
      flows: [
        {
          ...useFlowsStore.getState().flows[0],
          steps,
        },
      ],
    });

    expect(
      stepsService.getFollowingStep({ integrationId: MOCK_FLOW_ID, UUID: 'two' } as IStepProps),
    ).toMatchObject({ UUID: 'three' });
    expect(
      stepsService.getFollowingStep({
        integrationId: MOCK_FLOW_ID,
        UUID: 'three',
      } as IStepProps),
    ).toBeFalsy();
  });

  it('getStepNested(): gets a nested step with its UUID', () => {
    useNestedStepsStore.getState().addStep({ stepUuid: 'strawberry' } as INestedStep);
    expect(stepsService.getStepNested('strawberry')).toMatchObject({ stepUuid: 'strawberry' });
  });

  it('getPreviousStep(): should return the step preceding the one provided', () => {
    const steps = [
      {
        UUID: 'one',
      } as IStepProps,
      {
        UUID: 'two',
      } as IStepProps,
      {
        UUID: 'three',
      } as IStepProps,
    ];

    useFlowsStore.setState({
      flows: [
        {
          ...useFlowsStore.getState().flows[0],
          steps,
        },
      ],
    });

    expect(
      stepsService.getPreviousStep({ integrationId: MOCK_FLOW_ID, UUID: 'one' } as IStepProps),
    ).toBeFalsy();
    expect(
      stepsService.getPreviousStep({ integrationId: MOCK_FLOW_ID, UUID: 'two' } as IStepProps),
    ).toMatchObject({ UUID: 'one' });
  });

  it('handleAppendStep(): should append a step to another and update the store', async () => {
    useFlowsStore.getState().insertStep(
      MOCK_FLOW_ID,
      {
        integrationId: MOCK_FLOW_ID,
        name: 'lychee',
        UUID: 'lychee',
        type: 'START',
      } as IStepProps,
      { mode: 'append' },
    );

    expect(useFlowsStore.getState().flows[0].steps).toHaveLength(1);

    // mock fetching additional parameters for new step
    jest
      .mocked(fetchStepDetails)
      .mockResolvedValueOnce({ name: 'raspberry', type: 'START', parameters: [] });

    await stepsService
      .handleAppendStep(
        { integrationId: MOCK_FLOW_ID, name: 'lychee', UUID: 'lychee' } as IStepProps,
        { integrationId: MOCK_FLOW_ID, name: 'raspberry', UUID: 'raspberry' } as IStepProps,
      )
      .then(() => {
        expect(useFlowsStore.getState().flows[0].steps).toHaveLength(2);
      });

    expect(fetchStepDetails).toHaveBeenCalled();
  });

  it('handleDropOnExistingStep(): should replace an existing step and update the store', async () => {
    useFlowsStore.getState().insertStep(
      MOCK_FLOW_ID,
      {
        integrationId: MOCK_FLOW_ID,
        name: 'lychee',
        UUID: 'lychee',
        type: 'START',
      } as IStepProps,
      { mode: 'append' },
    );

    expect(useFlowsStore.getState().flows[0].steps[0].UUID).toContain('lychee');

    // mock fetching additional parameters for new step
    jest
      .mocked(fetchStepDetails)
      .mockResolvedValueOnce({ name: 'raspberry', type: 'START', parameters: [] });

    await stepsService
      .handleDropOnExistingStep(
        { step: { integrationId: MOCK_FLOW_ID, type: 'START' } } as IVizStepNodeData,
        {
          integrationId: MOCK_FLOW_ID,
          name: 'lychee',
          UUID: `${MOCK_FLOW_ID}_lychee-0`,
        } as IStepProps,
        {
          integrationId: MOCK_FLOW_ID,
          name: 'raspberry',
          UUID: `${MOCK_FLOW_ID}_raspberry-0`,
        } as IStepProps,
      )
      .then(() => {
        expect(useFlowsStore.getState().flows[0].steps[0].UUID).toContain(
          `${MOCK_FLOW_ID}_raspberry`,
        );
      });

    expect(fetchStepDetails).toHaveBeenCalled();
  });

  it('handleInsertStep(): should insert a step between two specified steps and update the store', async () => {
    useFlowsStore.setState({
      flows: [
        {
          ...useFlowsStore.getState().flows[0],
          id: MOCK_FLOW_ID,
          steps: [
            { integrationId: MOCK_FLOW_ID, name: 'apple', UUID: 'apple-0', type: 'START' },
            {
              integrationId: MOCK_FLOW_ID,
              name: 'watermelon',
              UUID: 'watermelon-1',
              type: 'MIDDLE',
            },
          ] as IStepProps[],
        },
      ],
    });

    expect(useFlowsStore.getState().flows[0].steps[0].UUID).toContain('apple');

    // mock fetching additional parameters for new step
    jest
      .mocked(fetchStepDetails)
      .mockResolvedValueOnce({ name: 'grape', type: 'START', parameters: [] });

    await stepsService
      .handleInsertStep(
        {
          data: {
            step: { integrationId: MOCK_FLOW_ID, name: 'watermelon', UUID: 'watermelon-1' },
          },
        } as IVizStepNode,
        { name: 'grape', UUID: 'grape-1' } as IStepProps,
      )
      .then(() => {
        // new step UUID should contain the target node's old index
        expect(useFlowsStore.getState().flows[0].steps[1].UUID).toContain('grape-1');
        // UUID for watermelon should contain the new index
        expect(useFlowsStore.getState().flows[0].steps[2].UUID).toContain('watermelon-2');
      });

    expect(fetchStepDetails).toHaveBeenCalled();
  });

  it('handlePrependStep(): should insert a step before another and update the store', async () => {
    useFlowsStore.setState({
      flows: [
        {
          ...useFlowsStore.getState().flows[0],
          id: MOCK_FLOW_ID,
          steps: [
            { integrationId: MOCK_FLOW_ID, name: 'cherry', UUID: 'cherry-0', type: 'START' },
            { integrationId: MOCK_FLOW_ID, name: 'peach', UUID: 'peach-1', type: 'MIDDLE' },
          ] as IStepProps[],
        },
      ],
    });

    expect(useFlowsStore.getState().flows[0].steps[0].UUID).toContain('cherry');

    // mock fetching additional parameters for new step
    jest
      .mocked(fetchStepDetails)
      .mockResolvedValueOnce({ name: 'lime', type: 'START', parameters: [] });

    await stepsService
      .handlePrependStep(
        MOCK_FLOW_ID,
        { name: 'peach', UUID: 'peach-1' } as IStepProps,
        { name: 'lime', UUID: 'lime-1' } as IStepProps,
      )
      .then(() => {
        expect(useFlowsStore.getState().flows[0].steps[1].UUID).toContain('lime');
        expect(useFlowsStore.getState().flows[0].steps[2].UUID).toContain('peach');
      });

    expect(fetchStepDetails).toHaveBeenCalled();
  });

  describe('hasCustomStepExtension(): should determine if the specified step has a step extension', () => {
    it('should return "false" for empty views', () => {
      const result = StepsService.hasCustomStepExtension(
        { UUID: 'random-id' } as IStepProps,
        [] as IViewProps[],
      );

      expect(result).toBeFalsy();
    });

    it('should return "false" for a matching view with no URL available', () => {
      const result = StepsService.hasCustomStepExtension(
        { UUID: 'random-id' } as IStepProps,
        [{ step: 'random-id', url: '' }] as IViewProps[],
      );

      expect(result).toBeFalsy();
    });

    it('should return "false" for non-matching views', () => {
      const result = StepsService.hasCustomStepExtension(
        { UUID: 'random-id' } as IStepProps,
        [{ step: 'not-a-random-id', url: '/dev/null' }] as IViewProps[],
      );

      expect(result).toBeFalsy();
    });

    it('should return "true" for matching views and an URL available', () => {
      const result = StepsService.hasCustomStepExtension(
        { UUID: 'random-id' } as IStepProps,
        [{ step: 'random-id', url: '/dev/null' }] as IViewProps[],
      );

      expect(result).toBeTruthy();
    });
  });

  it('insertStep(): should insert the provided step at the index specified, in a given array of steps', () => {
    const steps = [
      {
        name: 'strawberry',
      },
      {
        name: 'blueberry',
      },
    ] as IStepProps[];

    expect(StepsService.insertStep(steps, 2, { name: 'peach' } as IStepProps)).toHaveLength(3);
    // does it insert it at the correct spot?
    expect(StepsService.insertStep(steps, 2, { name: 'peach' } as IStepProps)[2]).toEqual({
      name: 'peach',
    });
  });

  it('isFirstStepEip(): should determine if the provided step is an EIP', () => {
    const firstBranch = branchSteps[1].branches![0];
    expect(StepsService.isFirstStepEip(branchSteps)).toBe(false);
    expect(StepsService.isFirstStepEip(firstBranch.steps)).toBe(true);
  });

  it('isFirstStepStart(): should determine if the first step is a START', () => {
    // first step is a START
    expect(StepsService.isFirstStepStart(steps)).toBe(true);

    expect(
      StepsService.isFirstStepStart([
        {
          id: 'pdf-action',
          name: 'pdf-action',
          type: 'MIDDLE',
          UUID: 'pdf-action-1',
          group: 'PDF',
          kind: 'Kamelet',
          title: 'PDF Action',
        } as IStepProps,
      ]),
    ).toBe(false);
  });

  it('isEndStep(): should determine if the provided step is an END step', () => {
    expect(StepsService.isEndStep(branchSteps[3])).toBe(true);
    expect(StepsService.isEndStep(branchSteps[0])).toBe(false);
  });

  it('isMiddleStep(): should determine if the provided step is a MIDDLE step', () => {
    expect(StepsService.isMiddleStep(branchSteps[1])).toBe(true);
    expect(StepsService.isMiddleStep(branchSteps[0])).toBe(false);
  });

  it('isStartStep(): should determine if the provided step is a START step', () => {
    expect(StepsService.isStartStep(branchSteps[0])).toBe(true);
    expect(StepsService.isStartStep(branchSteps[1])).toBe(false);
  });

  it('replacePlaceholderStep(): should replace a placeholder with a step and update the store', async () => {
    expect(useFlowsStore.getState().flows[0].steps).toHaveLength(0);

    // mock fetching additional parameters for new step
    jest
      .mocked(fetchStepDetails)
      .mockResolvedValueOnce({ name: 'strawberry', type: 'START', parameters: [] });

    await stepsService
      .replacePlaceholderStep(
        { step: { integrationId: MOCK_FLOW_ID, type: 'START' } } as IVizStepNodeData,
        { name: 'strawberry', UUID: 'strawberry-0' } as IStepProps,
      )
      .then(() => {
        expect(useFlowsStore.getState().flows[0].steps).toHaveLength(1);
        expect(useFlowsStore.getState().flows[0].steps[0].UUID).toContain('strawberry');
      });

    expect(fetchStepDetails).toHaveBeenCalled();
  });

  it('supportsBranching(): should determine if the provided step supports branching', () => {
    expect(
      StepsService.supportsBranching({
        UUID: 'with-branches',
        minBranches: 0,
        maxBranches: -1,
      } as IStepProps),
    ).toBeTruthy();

    // we should NOT rely on the `branches` array to determine if a step supports branching,
    // in case we ever decide to return empty branches for all steps
    expect(
      StepsService.supportsBranching({
        UUID: 'no-min-max-props',
        branches: [] as IStepPropsBranch[],
      } as IStepProps),
    ).toBeFalsy();

    expect(StepsService.supportsBranching({ UUID: 'no-branches' } as IStepProps)).toBeFalsy();
  });

  it('updateStepParameters(): should update existing parameters for specified step, with provided values', () => {
    const step = {
      UUID: `${MOCK_FLOW_ID}_plum-0`,
      name: 'plum',
      parameters: [{ type: 'string', id: 'description', value: 'wat' }] as IStepPropsParameters[],
    } as IStepProps;
    useFlowsStore.getState().insertStep(MOCK_FLOW_ID, step, { mode: 'append' });

    stepsService.updateStepParameters(step, { description: 'guava' });

    expect(useFlowsStore.getState().flows[0].steps).toHaveLength(1);
    expect(useFlowsStore.getState().flows[0].steps[0].parameters![0]).toMatchObject({
      type: 'string',
      id: 'description',
      value: 'guava',
    });
  });

  it('updateViews(): should call on apiService to fetch views for provided steps', async () => {
    const step = {
      name: 'plum',
      parameters: [{ type: 'string', id: 'description', value: 'wat' }] as IStepPropsParameters[],
    } as IStepProps;
    useFlowsStore.getState().insertStep(MOCK_FLOW_ID, step, { mode: 'append' });
    expect(useFlowsStore.getState().flows[0].steps).toHaveLength(1);
    expect(useFlowsStore.getState().views).toHaveLength(0);

    // mock fetching additional parameters for new step
    jest.mocked(fetchViews).mockResolvedValueOnce([
      {
        name: 'Integration View',
        type: 'generic',
        id: 'integration',
        properties: {},
        step: null,
        url: null,
        constraints: null,
        scope: null,
        module: null,
      },
    ]);

    await stepsService.updateViews().then(() => {
      expect(useFlowsStore.getState().views).toHaveLength(1);
    });
  });
});
