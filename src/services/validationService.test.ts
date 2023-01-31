import { canStepBeReplaced, prependableStepTypes } from './validationService';
import { IStepProps, IVizStepNodeData } from '@kaoto/types';

describe('validationService', () => {
  it('canStepBeReplaced(): should return a boolean to determine if a step can be replaced', () => {
    // start steps
    expect(
      canStepBeReplaced(
        { step: { type: 'START' } } as IVizStepNodeData,
        { type: 'START' } as IStepProps
      ).isValid
    ).toBeTruthy();
    expect(
      canStepBeReplaced(
        { step: { type: 'START' } } as IVizStepNodeData,
        { type: 'MIDDLE' } as IStepProps
      ).isValid
    ).toBeFalsy();
    expect(
      canStepBeReplaced(
        { step: { type: 'START' } } as IVizStepNodeData,
        { type: 'END' } as IStepProps
      ).isValid
    ).toBeFalsy();

    // middle steps
    expect(
      canStepBeReplaced(
        { step: { type: 'MIDDLE' } } as IVizStepNodeData,
        { type: 'START' } as IStepProps
      ).isValid
    ).toBeFalsy();
    expect(
      canStepBeReplaced(
        { step: { type: 'MIDDLE' } } as IVizStepNodeData,
        { type: 'MIDDLE' } as IStepProps
      ).isValid
    ).toBeTruthy();
    expect(
      canStepBeReplaced(
        { step: { type: 'MIDDLE' }, isLastStep: false } as IVizStepNodeData,
        { type: 'END' } as IStepProps
      ).isValid
    ).toBeFalsy();
    expect(
      canStepBeReplaced(
        { step: { type: 'MIDDLE' }, isLastStep: true } as IVizStepNodeData,
        { type: 'END' } as IStepProps
      ).isValid
    ).toBeTruthy();

    // end steps
    expect(
      canStepBeReplaced(
        { step: { type: 'END' } } as IVizStepNodeData,
        { type: 'START' } as IStepProps
      ).isValid
    ).toBeFalsy();
    expect(
      canStepBeReplaced(
        { step: { type: 'END' }, isLastStep: true } as IVizStepNodeData,
        { type: 'MIDDLE' } as IStepProps
      ).isValid
    ).toBeTruthy();
    expect(
      canStepBeReplaced(
        { step: { type: 'END' }, isLastStep: true } as IVizStepNodeData,
        { type: 'END' } as IStepProps
      ).isValid
    ).toBeTruthy();

    // branch placeholder step
    expect(
      canStepBeReplaced(
        { step: { type: 'START' }, branchInfo: {}, isPlaceholder: true } as IVizStepNodeData,
        { type: 'START' } as IStepProps
      ).isValid
    ).toBeFalsy();
    expect(
      canStepBeReplaced(
        { step: { type: 'START' }, branchInfo: {}, isPlaceholder: true } as IVizStepNodeData,
        { type: 'MIDDLE' } as IStepProps
      ).isValid
    ).toBeTruthy();
    expect(
      canStepBeReplaced(
        {
          step: { type: 'START' },
          branchInfo: {},
          isPlaceholder: true,
        } as IVizStepNodeData,
        { type: 'END' } as IStepProps
      ).isValid
    ).toBeTruthy();
  });

  it('prependableStepTypes(): should return a comma-separated string of step types that can be prepended to a step', () => {
    expect(prependableStepTypes()).toEqual('MIDDLE');
  });
});
