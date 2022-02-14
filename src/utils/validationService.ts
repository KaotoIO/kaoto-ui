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
 */
export function canStepBeReplaced(existingStep: any, proposedStep: any): boolean {
  let isValid = false;
  // initial shallow check of step type, where the
  // existing step is treated as a first class citizen,
  // regardless if it's a slot or not
  if (existingStep.connectorType === proposedStep.type) {
    isValid = true;
    console.log('they are equal, should be valid...');
    return isValid;
  }

  switch (existingStep.connectorType) {
    case 'START':
      // console.log('existingStep.connectorType: ' + existingStep.connectorType);
      // console.log('proposedStep.type: ' + proposedStep.type);
      isValid = proposedStep.type === 'START';
      // console.log('isValid: ' + proposedStep.type === 'START');
      break;
    case 'MIDDLE':
      // console.log('existingStep.connectorType: ' + existingStep.connectorType);
      // console.log('proposedStep.connectorType: ' + proposedStep.type);
      // isValid = proposedStep.type !== ('START' || 'END');
      // console.log('isValid: ' + proposedStep.type !== ('START' || 'END'));
      break;
    case 'END':
      console.log('existingStep.connectorType: ' + existingStep.connectorType);
      console.log('proposedStep.connectorType: ' + proposedStep.type);
      isValid = proposedStep.type === 'MIDDLE' || proposedStep.type === 'END';
      console.log('isValid: ' + proposedStep.type === 'MIDDLE' || proposedStep.type === 'END');
      break;
  }

  return isValid;
}
