import { IStepProps } from '@kaoto/types';

export const getSortedParameters = (step: IStepProps): string[] => {
  if (!Array.isArray(step.parameters)) {
    return [];
  }

  const parametersSet = new Set<string>();
  step.required
    ?.slice()
    .sort((keyA, keyB) => {
      return keyA.localeCompare(keyB);
    })
    .forEach((parameterKey) => {
      parametersSet.add(parameterKey);
    });

  step.parameters
    .slice()
    .sort((parameterA, parameterB) => {
      return parameterA.id.localeCompare(parameterB.id);
    })
    .forEach((parameter) => {
      parametersSet.add(parameter.id);
    });

  const sortedParameters = Array.from(parametersSet);

  return sortedParameters;
};
