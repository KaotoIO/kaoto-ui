import branchSteps from '../store/data/branchSteps';
import nestedBranch from '../store/data/kamelet.nested-branch.steps';
import steps from '../store/data/steps';
import { StepsService } from './stepsService';
import { useIntegrationJsonStore, useNestedStepsStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps } from '@kaoto/types';

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
   * filterNestedSteps
   */
  it('filterNestedSteps(): should filter an array of steps given a conditional function', () => {
    const nestedSteps = [
      { branches: [{ steps: [{ branches: [{ steps: [{ UUID: 'log-340230' }] }] }] }] },
    ] as IStepProps[];
    expect(nestedSteps[0].branches![0].steps[0].branches![0].steps).toHaveLength(1);

    const filtered = StepsService.filterNestedSteps(
      nestedSteps,
      (step) => step.UUID !== 'log-340230'
    );
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

    const filtered = StepsService.filterStepWithBranches(
      step,
      (step: { UUID: string }) => step.UUID !== 'banana'
    );

    expect(filtered.branches![0].steps[0].branches![0].steps).toHaveLength(1);
  });

  /**
   * findStepIdxWithUUID
   */
  it("findStepIdxWithUUID(): should find a step's index, given a particular UUID", () => {
    expect(stepsService.findStepIdxWithUUID('caffeine-action-2', steps)).toEqual(2);
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

    expect(StepsService.prependStep(steps, { name: 'peach' } as IStepProps)).toHaveLength(3);
    expect(StepsService.prependStep(steps, { name: 'mango' } as IStepProps)[0]).toEqual({
      name: 'mango',
    });
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

    expect(StepsService.supportsBranching({ UUID: 'no-branches' } as IStepProps)).toBeFalsy();
  });
});
