import { useStepsAndViewsContext } from '../api';
import { IStepProps } from '../types';

/**
 * Validation for appending a step
 * @param connectingStep
 * @param appendedStep
 */
export function canStepBeAppended(connectingStep: any, appendedStep: any): boolean {
  let isValid = false;
  // initial shallow check of step type, where the
  // existing step is treated as a first class citizen,
  // regardless if it's a slot or not
  switch (connectingStep.connectorType) {
    case 'START':
      if (appendedStep.connectorType === 'START') {
        isValid = false;
      }
      break;
    case 'MIDDLE':
      isValid = true;
      break;
    case 'END':
      // you can't add anything onto an end step
      isValid = false;
      break;
  }

  return isValid;
}

/**
 * Validation for step replacement
 * @param existingStep
 * @param proposedStep
 * @param steps
 */
export function canStepBeReplaced(
  existingStep: any,
  proposedStep: any,
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
