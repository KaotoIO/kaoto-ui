import { IStepProps } from '../types';

/**
 * Checks kind of steps can be appended onto an existing step.
 * @param existingStepType
 */
export function appendableStepTypes(existingStepType: string): string {
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
 * @param existingStep
 * @param proposedStep
 * @param steps
 */
export function canStepBeReplaced(
  existingStep: any,
  proposedStep: IStepProps,
  steps: IStepProps[]
): { isValid: boolean; message?: string } {
  let isValid = false;
  let message = undefined;

  // initial shallow check of step type, where the
  // existing step is treated as a first class citizen,
  // regardless if it's a slot or not
  if ((existingStep.type || existingStep.step?.type) === proposedStep.type) {
    isValid = true;

    return { isValid, message: '' };
  }

  switch (existingStep.step?.type) {
    case 'START':
      isValid = proposedStep.type === 'START';
      message = 'First step must be a start step.';
      break;
    case 'MIDDLE':
    case 'END':
      // check if it's the last step
      if (steps[steps.length - 1].UUID === existingStep.UUID) {
        message = 'Last step must be a middle or end step.';
        isValid = proposedStep.type === 'MIDDLE' || proposedStep.type === 'END';
      } else if (existingStep.connectorType === 'MIDDLE' && proposedStep.type === 'END') {
        // not the last step, but trying to replace a MIDDLE step with an END step
        message = 'You cannot replace a middle step with an end step.';
      } else if (existingStep.connectorType === 'MIDDLE' && proposedStep.type === 'START') {
        // not the last step, but trying to replace a MIDDLE step with a START step
        message = 'You cannot replace a middle step with a start step.';
      }

      break;
  }

  return { isValid, message };
}

/**
 * Checks kind of steps can be appended onto an existing step.
 * @param _prevStep
 * @param _nextStep
 */
export function insertableStepTypes(_prevStep?: any, _nextStep?: any): string {
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
export function isNameValidCheck(name: string) {
  const regexPattern = /^[a-z\d]([-a-z\d]*[a-z\d])?(\.[a-z\d]([-a-z\d]*[a-z\d])?)*$/gm;
  return regexPattern.test(name);
}
