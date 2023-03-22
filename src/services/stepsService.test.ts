import branchSteps from '../store/data/branchSteps';
import nestedBranch from '../store/data/kamelet.nested-branch.steps';
import steps from '../store/data/steps';
import { StepsService } from './stepsService';
import { useIntegrationJsonStore, useNestedStepsStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps, IStepPropsBranch, IStepPropsParameters, IViewProps } from '@kaoto/types';

describe('stepsService', () => {
  const stepsService = new StepsService(
    useIntegrationJsonStore.getState(),
    useNestedStepsStore.getState(),
    useVisualizationStore.getState()
  );

  /**
   * containsBranches
   */
  it('containsBranches(): should determine if a given step contains branches', () => {
    expect(StepsService.containsBranches(branchSteps[0])).toBe(false);
    expect(StepsService.containsBranches(branchSteps[1])).toBe(true);
  });

  /**
   * extractNestedSteps
   */
  it('extractNestedSteps(): should create an array of properties for all nested steps', () => {
    const nested = nestedBranch.slice();
    expect(StepsService.extractNestedSteps(nested)).toHaveLength(6);
  });

  /**
   * findStepIdxWithUUID
   */
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
  });

  /**
   * flattenSteps
   */
  it('flattenSteps(): should flatten an array of deeply nested steps', () => {
    expect(nestedBranch).toHaveLength(4);
    const deeplyNestedBranchStepUuid = 'set-body-877932';
    expect(nestedBranch.some((s) => s.UUID === deeplyNestedBranchStepUuid)).toBeFalsy();

    const flattenedSteps = StepsService.flattenSteps(nestedBranch);
    expect(flattenedSteps).toHaveLength(10);
    expect(flattenedSteps.some((s) => s.UUID === deeplyNestedBranchStepUuid)).toBeTruthy();
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

    expect(StepsService.insertStep(steps, 2, { name: 'peach' } as IStepProps)).toHaveLength(3);
    // does it insert it at the correct spot?
    expect(StepsService.insertStep(steps, 2, { name: 'peach' } as IStepProps)[2]).toEqual({
      name: 'peach',
    });
  });

  /**
   * isFirstStepEip
   */
  it('isFirstStepEip(): should determine if the provided step is an EIP', () => {
    const firstBranch = branchSteps[1].branches![0];
    expect(StepsService.isFirstStepEip(branchSteps)).toBe(false);
    expect(StepsService.isFirstStepEip(firstBranch.steps)).toBe(true);
  });

  /**
   * isFirstStepStart
   */
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

  /**
   * isEndStep
   */
  it('isEndStep(): should determine if the provided step is an END step', () => {
    expect(StepsService.isEndStep(branchSteps[3])).toBe(true);
    expect(StepsService.isEndStep(branchSteps[0])).toBe(false);
  });

  /**
   * isMiddleStep
   */
  it('isMiddleStep(): should determine if the provided step is a MIDDLE step', () => {
    expect(StepsService.isMiddleStep(branchSteps[1])).toBe(true);
    expect(StepsService.isMiddleStep(branchSteps[0])).toBe(false);
  });

  /**
   * isStartStep
   */
  it('isStartStep(): should determine if the provided step is a START step', () => {
    expect(StepsService.isStartStep(branchSteps[0])).toBe(true);
    expect(StepsService.isStartStep(branchSteps[1])).toBe(false);
  });

  /**
   * regenerateUuids
   */
  it('regenerateUuids(): should regenerate UUIDs for an array of steps', () => {
    expect(StepsService.regenerateUuids(steps)[0].UUID).toBeDefined();
    expect(StepsService.regenerateUuids(branchSteps)[0].UUID).toBeDefined();
    expect(StepsService.regenerateUuids(branchSteps)[1].UUID).toBeDefined();
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

  describe('hasCustomStepExtension()', () => {
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

  it('buildStepSchemaAndModel():should ignore empty array parameter', () => {
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
});
