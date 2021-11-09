import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { VisualizationSlot } from './VisualizationSlot';
import { IStepProps, IVizStepProps } from '../types';

describe.skip('VisualizationSlot.tsx', () => {
  test('component renders correctly', () => {
    const fakeSteps: { viz: IVizStepProps; model: IStepProps }[] = [];
    const fakeStep = {
      model: {
        apiVersion: '',
        id: '',
        icon: '',
        name: '',
        type: 'START',
      },
      viz: {
        id: '',
        label: '',
        position: {
          x: 0,
          y: 0,
        },
        temporary: false,
      },
    };

    fakeSteps.push(fakeStep);

    render(<VisualizationSlot steps={fakeSteps} />);
    const element = screen.getByTestId('visualization-slot');
    expect(element).toBeInTheDocument();
  });
});
