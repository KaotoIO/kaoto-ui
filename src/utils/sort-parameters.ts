import { IStepProps, IStepPropsParameters } from '@kaoto/types';

export const sortParameters = (selectedStep: IStepProps): IStepProps => {
  if (!Array.isArray(selectedStep.parameters)) {
    return selectedStep;
  }

  const parametersMap = selectedStep.parameters.reduce((acc, parameter) => {
    acc[parameter.id] = parameter;
    return acc;
  }, {} as Record<string, IStepPropsParameters>);

  const parametersSet = new Set<string>();
  selectedStep.required
    ?.slice()
    .sort((keyA, keyB) => {
      return keyA.localeCompare(keyB);
    })
    .forEach((parameterKey) => {
      parametersSet.add(parameterKey);
    });

  selectedStep.parameters
    .slice()
    .sort((parameterA, parameterB) => {
      return parameterA.id.localeCompare(parameterB.id);
    })
    .forEach((parameter) => {
      parametersSet.add(parameter.id);
    });

  const sortedParameters = Array.from(parametersSet).map((parameterId) => {
    return parametersMap[parameterId];
  });

  return { ...selectedStep, parameters: sortedParameters };
};
