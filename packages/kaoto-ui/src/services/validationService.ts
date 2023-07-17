import { FlowsStoreFacade } from '../store/FlowsStoreFacade';
import { IStepProps, IVizStepNodeData, ValidationResult, ValidationStatus } from '@kaoto/types';

/**
 *  * A collection of business logic to process validation related tasks.
 *  * @see StepsService
 *  * @see VisualizationService
 */
export class ValidationService {
  private static URI_REGEXP = /^[a-z\d]([-a-z\d]*[a-z\d])?(\.[a-z\d]([-a-z\d]*[a-z\d])?)*$/gm;

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
    proposedStep: IStepProps,
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
        return { isValid: false, message: 'Branches must start with an action or end step' };
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
        message = 'First step must be a start step';
        break;
      case 'MIDDLE':
      case 'END':
        // check if it's the last step
        if (existingNode.isLastStep) {
          message = 'Last step must be a middle or end step';
          isValid = proposedStep.type === 'MIDDLE' || proposedStep.type === 'END';
        } else if (existingNode.step.type === 'MIDDLE' && proposedStep.type === 'END') {
          // not the last step, but trying to replace a MIDDLE step with an END step
          message = 'You cannot replace a middle step with an end step';
        } else if (existingNode.step.type === 'MIDDLE' && proposedStep.type === 'START') {
          // not the last step, but trying to replace a MIDDLE step with a START step
          message = 'You cannot replace a middle step with a start step';
        }

        break;
    }

    return { isValid, message };
  }

  /**
   * Get the message to display in a tooltip when
   * the branches tab is disabled in the mini catalog
   * @param supportsBranching
   * @param maxBranches
   * @param branchesLength
   */
  static getBranchTabTooltipMsg(
    supportsBranching: boolean,
    maxBranches: number,
    branchesLength: number | undefined,
  ): string {
    if (!supportsBranching) {
      return "This step doesn't support branching";
    } else if (branchesLength === maxBranches) {
      return 'Max number of branches reached';
    } else {
      return '';
    }
  }

  /**
   * Get the message to display in a tooltip
   * for the button to add a step or branch
   * @param showBranchesTab
   * @param showStepsTab
   */
  static getPlusButtonTooltipMsg(showBranchesTab?: boolean, showStepsTab?: boolean): string {
    if (showStepsTab && showBranchesTab) {
      return 'Add a step or branch';
    } else if (showBranchesTab) {
      return 'Add a branch';
    } else if (showStepsTab) {
      return 'Add a step';
    } else {
      return 'Please click on the step to configure branches for it.';
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
  static isNameValidCheck(name: string): boolean {
    const isValid = ValidationService.URI_REGEXP.test(name);
    ValidationService.URI_REGEXP.lastIndex = 0;

    return isValid;
  }

  /**
   * Returns the step types that can be prepended to a step.
   */
  static prependableStepTypes(): string {
    return 'MIDDLE';
  }

  /**
   * Determines if the maximum number of branches has been reached
   * @param branchLength
   * @param maxBranches
   */
  static reachedMaxBranches(branchLength: number, maxBranches: number): boolean {
    return branchLength === maxBranches;
  }

  /**
   * Determines whether the number of minimum
   * branches has been reached (gone above the minimum)
   * @param branchLength
   * @param minBranches
   */
  static reachedMinBranches(branchLength: number, minBranches: number): boolean {
    return branchLength >= minBranches + 1;
  }

  static validateUniqueName(flowName: string): ValidationResult {
    const errMessages = [];
    const flowsIds = FlowsStoreFacade.getFlowsIds();

    const isValidURI = ValidationService.isNameValidCheck(flowName);
    if (!isValidURI) {
      errMessages.push('Name should only contain lowercase letters, numbers, and dashes');
    }

    const isUnique = !flowsIds.includes(flowName);
    if (!isUnique) {
      errMessages.push('Name must be unique');
    }

    return {
      status: isValidURI && isUnique ? ValidationStatus.Success : ValidationStatus.Error,
      errMessages,
    };
  }
}
