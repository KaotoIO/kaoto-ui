import { ValidationService } from './validationService';
import { IStepProps, IVizStepNodeData } from '@kaoto/types';

describe('validationService', () => {
  it('canStepBeReplaced(): should return a boolean to determine if a step can be replaced', () => {
    // start steps
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'START' } } as IVizStepNodeData,
        { type: 'START' } as IStepProps,
      ).isValid,
    ).toBeTruthy();
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'START' } } as IVizStepNodeData,
        { type: 'MIDDLE' } as IStepProps,
      ).isValid,
    ).toBeFalsy();
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'START' } } as IVizStepNodeData,
        { type: 'END' } as IStepProps,
      ).isValid,
    ).toBeFalsy();

    // middle steps
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'MIDDLE' } } as IVizStepNodeData,
        { type: 'START' } as IStepProps,
      ).isValid,
    ).toBeFalsy();
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'MIDDLE' } } as IVizStepNodeData,
        { type: 'MIDDLE' } as IStepProps,
      ).isValid,
    ).toBeTruthy();
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'MIDDLE' }, isLastStep: false } as IVizStepNodeData,
        { type: 'END' } as IStepProps,
      ).isValid,
    ).toBeFalsy();
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'MIDDLE' }, isLastStep: true } as IVizStepNodeData,
        { type: 'END' } as IStepProps,
      ).isValid,
    ).toBeTruthy();

    // end steps
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'END' } } as IVizStepNodeData,
        { type: 'START' } as IStepProps,
      ).isValid,
    ).toBeFalsy();
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'END' }, isLastStep: true } as IVizStepNodeData,
        { type: 'MIDDLE' } as IStepProps,
      ).isValid,
    ).toBeTruthy();
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'END' }, isLastStep: true } as IVizStepNodeData,
        { type: 'END' } as IStepProps,
      ).isValid,
    ).toBeTruthy();

    // branch placeholder step
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'START' }, branchInfo: {}, isPlaceholder: true } as IVizStepNodeData,
        { type: 'START' } as IStepProps,
      ).isValid,
    ).toBeFalsy();
    expect(
      ValidationService.canStepBeReplaced(
        { step: { type: 'START' }, branchInfo: {}, isPlaceholder: true } as IVizStepNodeData,
        { type: 'MIDDLE' } as IStepProps,
      ).isValid,
    ).toBeTruthy();
    expect(
      ValidationService.canStepBeReplaced(
        {
          step: { type: 'START' },
          branchInfo: {},
          isPlaceholder: true,
        } as IVizStepNodeData,
        { type: 'END' } as IStepProps,
      ).isValid,
    ).toBeTruthy();
  });

  it('getBranchTooltipMsg(): should return tooltip message for a disabled branch tab', () => {
    expect(ValidationService.getBranchTabTooltipMsg(false, 0, 0)).toBe(
      "This step doesn't support branching",
    );
    expect(ValidationService.getBranchTabTooltipMsg(true, 5, 5)).toBe(
      'Max number of branches reached',
    );
    expect(ValidationService.getBranchTabTooltipMsg(true, 5, 1)).toBe('');
  });

  it('getPlusButtonTooltipMsg(): should return the tooltip message for the plus button to add a step or branch', () => {
    expect(ValidationService.getPlusButtonTooltipMsg(true, true)).toBe('Add a step or branch');
    expect(ValidationService.getPlusButtonTooltipMsg(true, false)).toBe('Add a branch');
    expect(ValidationService.getPlusButtonTooltipMsg(false, true)).toBe('Add a step');
    expect(ValidationService.getPlusButtonTooltipMsg(false, false)).toBe(
      'Please click on the step to configure branches for it.',
    );
  });

  it('prependableStepTypes(): should return a comma-separated string of step types that can be prepended to a step', () => {
    expect(ValidationService.prependableStepTypes()).toEqual('MIDDLE');
  });

  it('reachedMaxBranches(): given a step, should determine whether the max number of branches has been reached', () => {
    // below max
    expect(ValidationService.reachedMaxBranches(1, 2)).toBeFalsy();

    // at max
    expect(ValidationService.reachedMaxBranches(2, 2)).toBeTruthy();

    // infinite
    expect(ValidationService.reachedMaxBranches(4, -1)).toBeFalsy();
  });

  it('reachedMinBranches(): given a step, should determine whether the threshold for min branches has been reached', () => {
    expect(ValidationService.reachedMinBranches(1, 2)).toBeFalsy();
    expect(ValidationService.reachedMinBranches(2, 2)).toBeFalsy();
    expect(ValidationService.reachedMinBranches(3, 2)).toBeTruthy();
  });
});
