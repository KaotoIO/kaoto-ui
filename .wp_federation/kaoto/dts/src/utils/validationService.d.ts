import { IStepProps } from '../types';
/**
 * Checks kind of steps can be appended onto an existing step.
 * @param existingStepType
 */
export declare function appendableStepTypes(existingStepType: string): string;
/**
 * Checks whether a step can replace an existing step.
 * @param existingStep
 * @param proposedStep
 * @param steps
 */
export declare function canStepBeReplaced(existingStep: any, proposedStep: IStepProps, steps: IStepProps[]): {
    isValid: boolean;
    message?: string;
};
/**
 * Checks kind of steps can be appended onto an existing step.
 * @param _prevStep
 * @param _nextStep
 */
export declare function insertableStepTypes(_prevStep?: any, _nextStep?: any): string;
/**
 * Verifies that the provided name is valid
 * Regex: [a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*
 * @param name
 */
export declare function isNameValidCheck(name: string): boolean;
