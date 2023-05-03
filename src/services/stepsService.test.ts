jest.mock('@kaoto/api', () => {
  const actual = jest.requireActual('@kaoto/api');

  return {
    ...actual,
    fetchDeployment: jest.fn(),
    fetchIntegrationSourceCode: jest.fn(),
    fetchStepDetails: jest.fn(),
    fetchViews: jest.fn(),
    startDeployment: jest.fn(),
    stopDeployment: jest.fn()
  };
});

import branchSteps from '../store/data/branchSteps';
import deployment from '../store/data/deployment';
import nestedBranch from '../store/data/kamelet.nested-branch.steps';
import steps from '../store/data/steps';
import YAML from '../store/data/yaml';
import { integrationSteps } from '../stubs';
import { StepsService } from './stepsService';
import {
  fetchDeployment,
  fetchIntegrationSourceCode,
  fetchStepDetails,
  fetchViews,
  startDeployment,
  stopDeployment,
} from '@kaoto/api';
import { useIntegrationJsonStore, useNestedStepsStore, useVisualizationStore } from '@kaoto/store';
import {
  INestedStep,
  IStepProps,
  IStepPropsBranch,
  IStepPropsParameters,
  IViewProps,
  IVizStepNode,
  IVizStepNodeData,
} from '@kaoto/types';

describe('stepsService', () => {
  const stepsService = new StepsService(
    useIntegrationJsonStore.getState(),
    useNestedStepsStore.getState(),
    useVisualizationStore.getState()
  );

  beforeEach(() => {
    useIntegrationJsonStore.getState().deleteIntegration();
  });

  it('addBranch(): should add a branch to the specified step from the store', () => {
    useIntegrationJsonStore.setState({
      integrationJson: {
        ...useIntegrationJsonStore.getState().integrationJson,
        steps: [
          { UUID: 'blueberry', name: 'blueberry', minBranches: 0, maxBranches: -1 },
        ] as IStepProps[],
      },
    });

    stepsService.addBranch(
      { UUID: 'blueberry', name: 'blueberry' } as IStepProps,
      { branchUuid: 'blueberry-branch-01', steps: [] as IStepProps[] } as IStepPropsBranch
    );

    expect(useIntegrationJsonStore.getState().integrationJson.steps[0].branches).toHaveLength(1);
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
    const step = {
      name: 'pineapple',
      parameters: [
        { title: 'Description', type: 'string', id: 'description', value: 'A fruit' },
      ] as IStepPropsParameters[],
    } as IStepProps;

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

    it('getIntegrationSource(): should call apiService to return the source code (YAML) for the current running deployment', async () => {
      const integration = {
        id: '',
        metadata: { name: 'Updated integration' },
        dsl: 'KameletBinding',
        params: [],
        namespace: 'default',
        steps: [],
      };
      jest.mocked(fetchIntegrationSourceCode).mockResolvedValueOnce(YAML);
      await stepsService
        .createKaotoApi(step, jest.fn(), jest.fn())
        .getIntegrationSource(integration, 'KameletBinding', 'default')
        .then(() => {
          expect(fetchIntegrationSourceCode).toHaveBeenCalled();
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
      expect(
        stepsService.createKaotoApi(step, jest.fn(), jest.fn()).stepParams.Description
      ).toEqual('A fruit');
    });

    it('stopDeployment(): should call apiService to stop the current running deployment', async () => {
      jest.mocked(stopDeployment).mockResolvedValueOnce('Deployment stopped...');
      stepsService
        .createKaotoApi(step, jest.fn(), jest.fn())
        .stopDeployment('Updated integration', 'default');
      expect(stopDeployment).toHaveBeenCalled();
    });

    it('updateStep(): should replace the current step with the one provided', () => {
      const customStep = { name: 'pineapple', UUID: 'pineapple-0' } as IStepProps;
      useIntegrationJsonStore.getState().insertStep(customStep, 0);
      expect(useIntegrationJsonStore.getState().integrationJson.steps[0].UUID).toContain(
        'pineapple'
      );
      stepsService
        .createKaotoApi(customStep, jest.fn(), jest.fn())
        .updateStep({ name: 'blackberry' } as IStepProps);
      expect(useIntegrationJsonStore.getState().integrationJson.steps[0].UUID).toContain(
        'blackberry'
      );
    });

    it('updateStepParams(): should call the provided callback for updating step params', () => {
      const saveConfig = jest.fn();
      stepsService.createKaotoApi(step, saveConfig, jest.fn()).updateStepParams({ name: 'pizza' });
      expect(saveConfig).toHaveBeenCalled();
    });
  });

  it('deleteBranch(): should delete branch from specified step from the store', () => {
    const step = {
      UUID: 'peach',
      name: 'peach',
      branches: [
        { branchUuid: 'peach-0|branch-0', steps: [] as IStepProps[] } as IStepPropsBranch,
      ] as IStepPropsBranch[],
    } as IStepProps;

    useIntegrationJsonStore.setState({
      integrationJson: {
        ...useIntegrationJsonStore.getState().integrationJson,
        steps: [step],
      },
    });

    expect(useIntegrationJsonStore.getState().integrationJson.steps[0].branches).toHaveLength(1);

    stepsService.deleteBranch(step, 'peach-0|branch-0');

    expect(useIntegrationJsonStore.getState().integrationJson.steps[0].branches).toHaveLength(0);
  });

  it('deleteStep(): should delete specified step from the store', () => {
    useIntegrationJsonStore.getState().insertStep({ name: 'pineapple' } as IStepProps, 0);
    expect(useIntegrationJsonStore.getState().integrationJson.steps).toHaveLength(1);
  });

  it('extractNestedSteps(): should create an array of properties for all nested steps', () => {
    const nested = nestedBranch.slice();
    expect(StepsService.extractNestedSteps(nested)).toHaveLength(6);
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
      stepsService.findStepIdxWithUUID('nested-step-1', nestedSteps[3].branches![0].steps)
    ).toEqual(1);

    // testing without explicitly passing a steps array
    useIntegrationJsonStore.setState({
      integrationJson: {
        ...useIntegrationJsonStore.getState().integrationJson,
        steps: steps,
      },
    });
    expect(stepsService.findStepIdxWithUUID('caffeine-action-2')).toEqual(2);
  });

  it('flattenSteps(): should flatten an array of deeply nested steps', () => {
    expect(nestedBranch).toHaveLength(4);
    const deeplyNestedBranchStepUuid = 'set-body-877932';
    expect(nestedBranch.some((s) => s.UUID === deeplyNestedBranchStepUuid)).toBeFalsy();

    const flattenedSteps = StepsService.flattenSteps(nestedBranch);
    expect(flattenedSteps).toHaveLength(10);
    expect(flattenedSteps.some((s) => s.UUID === deeplyNestedBranchStepUuid)).toBeTruthy();
  });

  it('getStepNested(): gets a nested step with its UUID', () => {
    useNestedStepsStore.getState().addStep({ stepUuid: 'strawberry' } as INestedStep);
    expect(stepsService.getStepNested('strawberry')).toMatchObject({ stepUuid: 'strawberry' });
  });

  it('handleAppendStep(): should append a step to another and update the store', async () => {
    useIntegrationJsonStore
      .getState()
      .insertStep({ name: 'lychee', UUID: 'lychee' } as IStepProps, 0);
    expect(useIntegrationJsonStore.getState().integrationJson.steps).toHaveLength(1);

    // mock fetching additional parameters for new step
    jest
      .mocked(fetchStepDetails)
      .mockResolvedValueOnce({ name: 'raspberry', type: 'START', parameters: [] });

    await stepsService
      .handleAppendStep(
        { name: 'lychee', UUID: 'lychee' } as IStepProps,
        { name: 'raspberry', UUID: 'raspberry' } as IStepProps
      )
      .then(() => {
        expect(useIntegrationJsonStore.getState().integrationJson.steps).toHaveLength(2);
      });

    expect(fetchStepDetails).toHaveBeenCalled();
  });

  it('handleDropOnExistingStep(): should replace an existing step and update the store', async () => {
    useIntegrationJsonStore
      .getState()
      .insertStep({ name: 'lychee', UUID: 'lychee', type: 'START' } as IStepProps, 0);
    expect(useIntegrationJsonStore.getState().integrationJson.steps[0].UUID).toContain('lychee');

    // mock fetching additional parameters for new step
    jest
      .mocked(fetchStepDetails)
      .mockResolvedValueOnce({ name: 'raspberry', type: 'START', parameters: [] });

    await stepsService
      .handleDropOnExistingStep(
        { step: { type: 'START' } } as IVizStepNodeData,
        { name: 'lychee', UUID: 'lychee-0' } as IStepProps,
        { name: 'raspberry', UUID: 'raspberry-0' } as IStepProps
      )
      .then(() => {
        expect(useIntegrationJsonStore.getState().integrationJson.steps[0].UUID).toContain(
          'raspberry'
        );
      });

    expect(fetchStepDetails).toHaveBeenCalled();
  });

  it('handleInsertStep(): should insert a step between two specified steps and update the store', async () => {
    useIntegrationJsonStore.setState({
      integrationJson: {
        ...useIntegrationJsonStore.getState().integrationJson,
        steps: [
          { name: 'apple', UUID: 'apple-0', type: 'START' },
          { name: 'watermelon', UUID: 'watermelon-1', type: 'MIDDLE' },
        ] as IStepProps[],
      },
    });

    expect(useIntegrationJsonStore.getState().integrationJson.steps[0].UUID).toContain('apple');

    // mock fetching additional parameters for new step
    jest
      .mocked(fetchStepDetails)
      .mockResolvedValueOnce({ name: 'grape', type: 'START', parameters: [] });

    await stepsService
      .handleInsertStep(
        { data: { step: { name: 'watermelon', UUID: 'watermelon-1' } } } as IVizStepNode,
        { name: 'grape', UUID: 'grape-1' } as IStepProps
      )
      .then(() => {
        // new step UUID should contain the target node's old index
        expect(useIntegrationJsonStore.getState().integrationJson.steps[1].UUID).toContain(
          'grape-1'
        );
        // UUID for watermelon should contain the new index
        expect(useIntegrationJsonStore.getState().integrationJson.steps[2].UUID).toContain(
          'watermelon-2'
        );
      });

    expect(fetchStepDetails).toHaveBeenCalled();
  });

  it('handlePrependStep(): should insert a step before another and update the store', async () => {
    useIntegrationJsonStore.setState({
      integrationJson: {
        ...useIntegrationJsonStore.getState().integrationJson,
        steps: [
          { name: 'cherry', UUID: 'cherry-0', type: 'START' },
          { name: 'peach', UUID: 'peach-1', type: 'MIDDLE' },
        ] as IStepProps[],
      },
    });

    expect(useIntegrationJsonStore.getState().integrationJson.steps[0].UUID).toContain('cherry');

    // mock fetching additional parameters for new step
    jest
      .mocked(fetchStepDetails)
      .mockResolvedValueOnce({ name: 'lime', type: 'START', parameters: [] });

    await stepsService
      .handlePrependStep(
        { name: 'peach', UUID: 'peach-1' } as IStepProps,
        { name: 'lime', UUID: 'lime-1' } as IStepProps
      )
      .then(() => {
        expect(useIntegrationJsonStore.getState().integrationJson.steps[1].UUID).toContain('lime');
        expect(useIntegrationJsonStore.getState().integrationJson.steps[2].UUID).toContain('peach');
      });

    expect(fetchStepDetails).toHaveBeenCalled();
  });

  describe('hasCustomStepExtension(): should determine if the specified step has a step extension', () => {
    it('should return "false" for empty views', () => {
      const result = StepsService.hasCustomStepExtension(
        { UUID: 'random-id' } as IStepProps,
        [] as IViewProps[]
      );

      expect(result).toBeFalsy();
    });

    it('should return "false" for a matching view with no URL available', () => {
      const result = StepsService.hasCustomStepExtension(
        { UUID: 'random-id' } as IStepProps,
        [{ step: 'random-id', url: '' }] as IViewProps[]
      );

      expect(result).toBeFalsy();
    });

    it('should return "false" for non-matching views', () => {
      const result = StepsService.hasCustomStepExtension(
        { UUID: 'random-id' } as IStepProps,
        [{ step: 'not-a-random-id', url: '/dev/null' }] as IViewProps[]
      );

      expect(result).toBeFalsy();
    });

    it('should return "true" for matching views and an URL available', () => {
      const result = StepsService.hasCustomStepExtension(
        { UUID: 'random-id' } as IStepProps,
        [{ step: 'random-id', url: '/dev/null' }] as IViewProps[]
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
      ])
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

  describe('regenerateUuids(): should (re)generate UUIDs for all steps', () => {
    it('should generate UUIDs for the main steps array', () => {
      const result = StepsService.regenerateUuids(integrationSteps);

      expect(result).toMatchObject<Partial<IStepProps>[]>([
        { UUID: 'timer-0' },
        { UUID: 'choice-1' },
      ]);
    });

    it('should generate UUIDs for branches', () => {
      const result = StepsService.regenerateUuids(integrationSteps);

      expect(result).toMatchObject<Partial<IStepProps>[]>([
        { UUID: 'timer-0', branches: [] },
        {
          UUID: 'choice-1',
          branches: [
            { branchUuid: 'choice-1|branch-0', steps: expect.any(Array), identifier: 'true path' },
            { branchUuid: 'choice-1|branch-1', steps: expect.any(Array), identifier: 'otherwise' },
          ],
        },
      ]);
    });

    it('should generate UUIDs for nested steps', () => {
      const result = StepsService.regenerateUuids(integrationSteps);

      expect(result).toMatchObject<Partial<IStepProps>[]>([
        { UUID: 'timer-0', branches: [] },
        {
          UUID: 'choice-1',
          branches: [
            {
              branchUuid: 'choice-1|branch-0',
              steps: [
                {
                  UUID: 'choice-1|branch-0|log-0',
                  integrationId: 'Camel Route-1',
                  minBranches: 0,
                  maxBranches: 0,
                  name: 'log',
                  type: 'MIDDLE',
                },
              ],
              identifier: 'true path',
            },
            {
              branchUuid: 'choice-1|branch-1',
              steps: [
                {
                  UUID: 'choice-1|branch-1|log-0',
                  integrationId: 'Camel Route-1',
                  minBranches: 0,
                  maxBranches: 0,
                  name: 'log',
                  type: 'MIDDLE',
                },
              ],
              identifier: 'otherwise',
            },
          ],
        },
      ]);
    });

    it('should generate UUIDs for nested steps at two levels deep', () => {
      const nestedIntegrationSteps: IStepProps[] = JSON.parse(JSON.stringify(integrationSteps));
      nestedIntegrationSteps[1].branches![0].steps = integrationSteps;

      const result = StepsService.regenerateUuids(nestedIntegrationSteps);

      expect(result).toMatchObject<Partial<IStepProps>[]>([
        { UUID: 'timer-0', branches: [] },
        {
          UUID: 'choice-1',
          branches: [
            {
              branchUuid: 'choice-1|branch-0',
              steps: [
                {
                  UUID: 'choice-1|branch-0|timer-0',
                  integrationId: 'Camel Route-1',
                  minBranches: 0,
                  maxBranches: 0,
                  name: 'timer',
                  type: 'START',
                  branches: [],
                },
                {
                  UUID: 'choice-1|branch-0|choice-1',
                  integrationId: 'Camel Route-1',
                  minBranches: 1,
                  maxBranches: -1,
                  name: 'choice',
                  type: 'MIDDLE',
                  branches: [
                    {
                      branchUuid: 'choice-1|branch-0|choice-1|branch-0',
                      steps: [
                        {
                          UUID: 'choice-1|branch-0|choice-1|branch-0|log-0',
                          integrationId: 'Camel Route-1',
                          minBranches: 0,
                          maxBranches: 0,
                          name: 'log',
                          type: 'MIDDLE',
                        },
                      ],
                      identifier: 'true path',
                    },
                    {
                      branchUuid: 'choice-1|branch-0|choice-1|branch-1',
                      steps: [
                        {
                          UUID: 'choice-1|branch-0|choice-1|branch-1|log-0',
                          integrationId: 'Camel Route-1',
                          minBranches: 0,
                          maxBranches: 0,
                          name: 'log',
                          type: 'MIDDLE',
                        },
                      ],
                      identifier: 'otherwise',
                    },
                  ],
                },
              ],
              identifier: 'true path',
            },
            {
              branchUuid: 'choice-1|branch-1',
              steps: [
                {
                  UUID: 'choice-1|branch-1|log-0',
                  integrationId: 'Camel Route-1',
                  minBranches: 0,
                  maxBranches: 0,
                  name: 'log',
                  type: 'MIDDLE',
                },
              ],
              identifier: 'otherwise',
            },
          ],
        },
      ]);
    });

    it('should regenerate UUIDs when a branch is removed', () => {
      const localIntegrationSteps = integrationSteps.slice(1);
      const result = StepsService.regenerateUuids(localIntegrationSteps);

      expect(result).toMatchObject<Partial<IStepProps>[]>([
        {
          UUID: 'choice-0',
          branches: [
            {
              branchUuid: 'choice-0|branch-0',
              steps: [
                {
                  UUID: 'choice-0|branch-0|log-0',
                  integrationId: 'Camel Route-1',
                  minBranches: 0,
                  maxBranches: 0,
                  name: 'log',
                  type: 'MIDDLE',
                },
              ],
              identifier: 'true path',
            },
            {
              branchUuid: 'choice-0|branch-1',
              steps: [
                {
                  UUID: 'choice-0|branch-1|log-0',
                  integrationId: 'Camel Route-1',
                  minBranches: 0,
                  maxBranches: 0,
                  name: 'log',
                  type: 'MIDDLE',
                },
              ],
              identifier: 'otherwise',
            },
          ],
        },
      ]);
    });
  });

  it('replacePlaceholderStep(): should replace a placeholder with a step and update the store', async () => {
    expect(useIntegrationJsonStore.getState().integrationJson.steps).toHaveLength(0);

    // mock fetching additional parameters for new step
    jest
      .mocked(fetchStepDetails)
      .mockResolvedValueOnce({ name: 'strawberry', type: 'START', parameters: [] });

    await stepsService
      .replacePlaceholderStep(
        { step: { type: 'START' } } as IVizStepNodeData,
        { name: 'strawberry', UUID: 'strawberry-0' } as IStepProps
      )
      .then(() => {
        expect(useIntegrationJsonStore.getState().integrationJson.steps).toHaveLength(1);
        expect(useIntegrationJsonStore.getState().integrationJson.steps[0].UUID).toContain(
          'strawberry'
        );
      });

    expect(fetchStepDetails).toHaveBeenCalled();
  });

  it('supportsBranching(): should determine if the provided step supports branching', () => {
    expect(
      StepsService.supportsBranching({
        UUID: 'with-branches',
        minBranches: 0,
        maxBranches: -1,
      } as IStepProps)
    ).toBeTruthy();

    // we should NOT rely on the `branches` array to determine if a step supports branching,
    // in case we ever decide to return empty branches for all steps
    expect(
      StepsService.supportsBranching({
        UUID: 'no-min-max-props',
        branches: [] as IStepPropsBranch[],
      } as IStepProps)
    ).toBeFalsy();

    expect(StepsService.supportsBranching({ UUID: 'no-branches' } as IStepProps)).toBeFalsy();
  });

  it('updateStepParameters(): should update existing parameters for specified step, with provided values', () => {
    const step = {
      name: 'plum',
      parameters: [{ type: 'string', id: 'description', value: 'wat' }] as IStepPropsParameters[],
    } as IStepProps;
    useIntegrationJsonStore.getState().insertStep(step, 0);

    stepsService.updateStepParameters(step, { description: 'guava' });

    expect(useIntegrationJsonStore.getState().integrationJson.steps).toHaveLength(1);
    expect(
      useIntegrationJsonStore.getState().integrationJson.steps[0].parameters![0]
    ).toMatchObject({ type: 'string', id: 'description', value: 'guava' });
  });

  it('updateViews(): should call on apiService to fetch views for provided steps', async () => {
    const step = {
      name: 'plum',
      parameters: [{ type: 'string', id: 'description', value: 'wat' }] as IStepPropsParameters[],
    } as IStepProps;
    useIntegrationJsonStore.getState().insertStep(step, 0);
    expect(useIntegrationJsonStore.getState().integrationJson.steps).toHaveLength(1);
    expect(useIntegrationJsonStore.getState().views).toHaveLength(0);

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
      expect(useIntegrationJsonStore.getState().views).toHaveLength(1);
    });
  });
});
