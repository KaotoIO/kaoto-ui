import { FlowsStoreFacade } from '../store/FlowsStoreFacade';
import { ValidationService } from './validationService';
import { IStepProps, IVizStepNodeData, ValidationStatus } from '@kaoto/types';

describe('validationService', () => {
  it('appendableStepTypes(): should return a string of possible steps that can be appended to an existing step', () => {
    expect(ValidationService.appendableStepTypes('START')).toEqual('MIDDLE,END');
    expect(ValidationService.appendableStepTypes('MIDDLE')).toEqual('MIDDLE,END');
    expect(ValidationService.appendableStepTypes('END')).toEqual('');
  });

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

  it.each([
    [undefined, undefined, 'START,MIDDLE,END'],
    [undefined, {} as IStepProps, 'MIDDLE'],
    [{} as IStepProps, undefined, 'MIDDLE,END'],
    [{} as IStepProps, {} as IStepProps, 'MIDDLE'],
  ])(
    'insertableStepTypes() should return "%s" when prevStep="%s" nextStep="%s"',
    (prevStep, nextStep, result) => {
      expect(ValidationService.insertableStepTypes(prevStep, nextStep)).toEqual(result);
    },
  );

  it.each([
    ['', false],
    ['.', false],
    ['/', false],
    ['Route', false],
    ['Route 1234', false],
    ['444', true],
    ['route', true],
    ['route-1234', true],
  ])('isNameValidCheck() should return "%s" when name="%s"', (name, result) => {
    expect(ValidationService.isNameValidCheck(name)).toEqual(result);
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

  describe('validateUniqueName()', () => {
    it('should return sucess if the name is unique', () => {
      jest.spyOn(FlowsStoreFacade, 'getFlowsIds').mockReturnValue(['flow-1234']);

      const result = ValidationService.validateUniqueName('unique-name');

      expect(result.status).toEqual(ValidationStatus.Success);
      expect(result.errMessages).toHaveLength(0);
    });

    it('should return an error if the name is not unique', () => {
      jest.spyOn(FlowsStoreFacade, 'getFlowsIds').mockReturnValue(['flow-1234']);

      const result = ValidationService.validateUniqueName('flow-1234');

      expect(result.status).toEqual(ValidationStatus.Error);
      expect(result.errMessages).toEqual(['Name must be unique']);
    });

    it('should return an error if the name is not a valid URI', () => {
      jest.spyOn(FlowsStoreFacade, 'getFlowsIds').mockReturnValue(['flow-1234']);

      const result = ValidationService.validateUniqueName('The amazing Route');

      expect(result.status).toEqual(ValidationStatus.Error);
      expect(result.errMessages).toEqual([
        'Name should only contain lowercase letters, numbers, and dashes',
      ]);
    });

    it('should return an error if the name is not unique neither a valid URI', () => {
      jest.spyOn(FlowsStoreFacade, 'getFlowsIds').mockReturnValue(['The amazing Route']);

      const result = ValidationService.validateUniqueName('The amazing Route');

      expect(result.status).toEqual(ValidationStatus.Error);
      expect(result.errMessages).toEqual([
        'Name should only contain lowercase letters, numbers, and dashes',
        'Name must be unique',
      ]);
    });
  });
});
