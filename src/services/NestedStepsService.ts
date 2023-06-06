import { INestedStep, IStepProps } from '@kaoto/types';
import { findPath } from '@kaoto/utils';

/**
 * NestedStepsService
 *
 * This class cannot import any store as this class its meant
 * for generating static data or to calculate outputs based on the
 * input methods.
 */
export class NestedStepsService {
  /**
   * Given an array of Steps, return an array containing *only*
   * the steps which are nested
   * @param steps
   */
  static extractNestedSteps(steps: IStepProps[]) {
    let tempSteps = steps.slice();
    let nestedSteps: INestedStep[] = [];

    const loopOverSteps = (
      steps: IStepProps[],
      parentStepUuid?: string,
      branchUuid?: string,
      branchIdx?: number,
    ) => {
      steps.forEach((step) => {
        if (parentStepUuid) {
          // this is a nested step
          nestedSteps.push({
            branchIndex: branchIdx ?? undefined,
            branchUuid,
            stepUuid: step.UUID,
            parentStepUuid,
            pathToBranch: branchUuid ? findPath(tempSteps, branchUuid, 'branchUuid') : undefined,
            pathToParentStep: findPath(tempSteps, parentStepUuid, 'UUID'),
            pathToStep: findPath(tempSteps, step.UUID, 'UUID'),
          } as INestedStep);
        }

        if (Array.isArray(step.branches)) {
          step.branches.forEach((branch, branchIdx) => {
            // it contains nested steps; we will need to store the branch info
            // and the path to it, for each of those steps
            return loopOverSteps(branch.steps, step.UUID, branch.branchUuid, branchIdx);
          });
        }
      });
    };

    loopOverSteps(tempSteps);

    return nestedSteps;
  }
}
