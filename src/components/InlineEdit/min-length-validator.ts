import { ValidationResult, ValidationStatus } from '../../types';

export const minLengthValidator = (value: string): ValidationResult => {
  if (value.length < 5) {
    return {
      status: ValidationStatus.Error,
      errMessages: ['Value must be at least 5 characters long'],
    };
  }

  return {
    status: ValidationStatus.Success,
    errMessages: [],
  };
};
