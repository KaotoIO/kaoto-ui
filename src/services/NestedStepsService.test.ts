import nestedBranch from '../store/data/kamelet.nested-branch.steps';
import { NestedStepsService } from './NestedStepsService';

describe('NestedStepsService', () => {
  it('extractNestedSteps(): should create an array of properties for all nested steps', () => {
    const nested = nestedBranch.slice();
    expect(NestedStepsService.extractNestedSteps(nested)).toHaveLength(6);
  });
});
