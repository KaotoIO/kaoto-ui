import { IStepProps } from '../types';

export default function SortSteps( steps : IStepProps[]) {
  const start: IStepProps[] = [];
  const middle: IStepProps[] = [];
  const end: IStepProps[] = [];

  steps.map((step) => {
    switch(step.type) {
      case 'START':
        start.push(step);
        break;
      case 'MIDDLE':
        middle.push(step);
        break;
      case 'END':
        end.push(step);
        break;
    }
  });

  return {
    start,
    middle,
    end
  };
};
