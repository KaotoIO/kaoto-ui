import { IStepProps, IVizStepNodeData } from '@kaoto/types';

/**
 *  * A collection of business logic to process validation related tasks.
 *  * @see StepsService
 *  * @see VisualizationService
 */
export class ValidationService {
  /**
   * Checks kind of steps can be appended onto an existing step.
   * @param existingStepType
   */
  static appendableStepTypes(existingStepType: string): string {
    let possibleSteps: string = '';

    switch (existingStepType) {
      case 'START':
      case 'MIDDLE':
        // cannot append a START step to a START or MIDDLE step
        possibleSteps = 'MIDDLE,END';
        break;
    }

    return possibleSteps;
  }

  /**
   * Checks whether a step can replace an existing step.
   * @param existingNode
   * @param proposedStep
   */
  static canStepBeReplaced(
    existingNode: IVizStepNodeData,
    proposedStep: IStepProps
  ): { isValid: boolean; message?: string } {
    let isValid = false;
    let message = undefined;

    // if step is a placeholder and within a branch,
    // this requires special handling
    if (existingNode.isPlaceholder && existingNode.branchInfo) {
      // placeholders will always be the first step
      if (proposedStep.type === 'MIDDLE' || proposedStep.type === 'END') {
        return { isValid: true };
      } else {
        return { isValid: false, message: 'Branches must start with a middle or end step.' };
      }
    }

    // initial shallow check of step type, where the
    // existing step is treated as a first class citizen,
    // regardless if it's a slot or not
    if (existingNode.step.type === proposedStep.type) {
      isValid = true;

      return { isValid, message: '' };
    }

    switch (existingNode.step.type) {
      case 'START':
        isValid = proposedStep.type === 'START';
        message = 'First step must be a start step.';
        break;
      case 'MIDDLE':
      case 'END':
        // check if it's the last step
        if (existingNode.isLastStep) {
          message = 'Last step must be a middle or end step.';
          isValid = proposedStep.type === 'MIDDLE' || proposedStep.type === 'END';
        } else if (existingNode.step.type === 'MIDDLE' && proposedStep.type === 'END') {
          // not the last step, but trying to replace a MIDDLE step with an END step
          message = 'You cannot replace a middle step with an end step.';
        } else if (existingNode.step.type === 'MIDDLE' && proposedStep.type === 'START') {
          // not the last step, but trying to replace a MIDDLE step with a START step
          message = 'You cannot replace a middle step with a start step.';
        }

        break;
    }

    return { isValid, message };
  }

  static getPlusButtonTooltipMsg(showBranchesTab: boolean, showStepsTab: boolean): string {
    if (showStepsTab && showBranchesTab) {
      return 'Add a step or branch';
    } else if (showBranchesTab) {
      return 'Add a branch';
    } else if (showStepsTab) {
      return 'Add a step';
    } else {
      return '';
    }
  }

  /**
   * Checks kind of steps can be appended onto an existing step.
   * @param _prevStep
   * @param _nextStep
   */
  static insertableStepTypes(_prevStep?: IStepProps, _nextStep?: IStepProps): string {
    let possibleSteps: string[] = ['START', 'MIDDLE', 'END'];
    if (_prevStep) {
      // inserted step can be MIDDLE or END
      possibleSteps = possibleSteps.filter((val) => val !== 'START');
    }
    if (_nextStep) {
      // inserted step must be MIDDLE
      possibleSteps = possibleSteps.filter((val) => val !== 'START');
      possibleSteps = possibleSteps.filter((val) => val !== 'END');
    }
    return possibleSteps.join(',');
  }

  /**
   * Verifies that the provided name is valid
   * Regex: [a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*
   * @param name
   */
  static isNameValidCheck(name: string) {
    const regexPattern = /^[a-z\d]([-a-z\d]*[a-z\d])?(\.[a-z\d]([-a-z\d]*[a-z\d])?)*$/gm;
    return regexPattern.test(name);
  }

  /**
   * Returns the step types that can be prepended to a step.
   */
  static prependableStepTypes(): string {
    return 'MIDDLE';
  }
}
