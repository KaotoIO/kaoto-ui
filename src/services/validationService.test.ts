import { prependableStepTypes } from './validationService';

describe('validationService', () => {
  it('prependableStepTypes(): should return a comma-separated string of step types that can be prepended to a step', () => {
    expect(prependableStepTypes()).toEqual('MIDDLE');
  });
});
