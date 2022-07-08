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

export function canBeDeployed(): boolean {
  // console.log('check if can be deployed: ', integrationSteps);
  // let valid = true;
  // in order for an integration to be deployable, it needs to have at least
  // one step, and no mis-configured steps or placeholders
  // if (integrationSteps > 0 && integrationSteps[0].type !== 'slot') {
  //   valid = true;
  // }

  // return valid;
  return true;
}

/**
 * Checks whether a proposed step can be inserted between two existing steps.
 * @param _previousStep
 * @param _insertedStep
 * @param _nextStep
 */
export function canStepBeInserted(
  _previousStep: any,
  _insertedStep: any,
  _nextStep: any
): { isValid: boolean; message?: string } {
  let message = undefined;

  return { isValid: false, message };
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
  if (existingStep.connectorType === proposedStep.type) {
    isValid = true;
    return { isValid, message: '' };
  }

  switch (existingStep.connectorType) {
    case 'START':
      isValid = proposedStep.type === 'START';
      message = 'First step must be a start step.';
      break;
    case 'MIDDLE':
    case 'END':
      // check first that it's actually at the end of the steps array
      // to handle edge cases where the end step has been replaced by a
      // middle step, and now uses that for validation, meaning you
      // cannot replace it wih a sink
      if (steps[steps.length - 1].UUID === existingStep.UUID) {
        message = 'Last step must be a middle or end step.';
        isValid = proposedStep.type === 'MIDDLE' || proposedStep.type === 'END';
      } else if (existingStep.connectorType === 'MIDDLE' && proposedStep.type === 'END') {
        // not the last step, but trying to replace a middle step with an end step
        message = 'You cannot replace a middle step with an end step.';
      }

      break;
  }

  return { isValid, message };
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
