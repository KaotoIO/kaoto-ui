import { IStepProps } from '../types';

/**
 * Checks whether a step can be appended onto an existing step.
 * @param existingStep
 * @param appendedStep
 */
export function canStepBeAppended(existingStep: any, appendedStep: any): boolean {
  let isValid = false;

  switch (existingStep.connectorType) {
    case 'START':
    case 'MIDDLE':
      // cannot append a START step to a START or MIDDLE step
      isValid = appendedStep.connectorType !== 'START';
      break;
    case 'END':
      // you can't add anything onto an end step
      isValid = false;
      break;
  }

  return isValid;
}

/**
 * Checks whether a proposed step can be inserted between two existing steps.
 * @param _previousStep
 * @param _insertedStep
 * @param _nextStep
 */
export function canStepBeInserted(_previousStep: any, _insertedStep: any, _nextStep: any): boolean {
  return false;
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
): boolean {
  let isValid = false;
  // initial shallow check of step type, where the
  // existing step is treated as a first class citizen,
  // regardless if it's a slot or not
  if (existingStep.connectorType === proposedStep.type) {
    isValid = true;
    return isValid;
  }

  switch (existingStep.connectorType) {
    case 'START':
      isValid = proposedStep.type === 'START';
      break;
    case 'MIDDLE':
    case 'END':
      // check first that it's actually at the end of the steps array
      // to handle edge cases where the end step has been replaced by a
      // middle step, and now uses that for validation, meaning you
      // cannot replace it wih a sink
      if (steps[steps.length - 1].UUID === existingStep.UUID) {
        isValid = proposedStep.type === 'MIDDLE' || proposedStep.type === 'END';
      }
      break;
  }

  return isValid;
}
