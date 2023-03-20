import { TooltipPosition } from '@patternfly/react-core';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Position } from 'reactflow';
import { useVisualizationStore } from '@kaoto/store';
import { usePosition } from './position.hook';

describe('usePosition', () => {
  it('initial state', async () => {
    const wrapper = render(
      <TestComponent />
    );

    const element = await wrapper.findByTestId('test-element');

    expect(element).toHaveAttribute('data-layout', 'LR');
    expect(element).toHaveAttribute('data-plusicon-position', Position.Top);
    expect(element).toHaveAttribute('data-minusicon-position', Position.Top);
    expect(element).toHaveAttribute('data-lefthandle-position', Position.Left);
    expect(element).toHaveAttribute('data-righthandle-position', Position.Right);
    expect(element).toHaveAttribute('data-tooltip-position', TooltipPosition.top);
  });

  it('should update position atrributes when layout="TB"', async () => {
    const wrapper = render(
      <TestComponent />
    );

    act(() => {
      useVisualizationStore.getState().setLayout('TB');
    });

    const element = await wrapper.findByTestId('test-element');

    expect(element).toHaveAttribute('data-layout', 'TB');
    expect(element).toHaveAttribute('data-plusicon-position', Position.Right);
    expect(element).toHaveAttribute('data-minusicon-position', Position.Left);
    expect(element).toHaveAttribute('data-lefthandle-position', Position.Top);
    expect(element).toHaveAttribute('data-righthandle-position', Position.Bottom);
    expect(element).toHaveAttribute('data-tooltip-position', TooltipPosition.right);
  });
});

function TestComponent() {
  const {
    layout,
    plusIconPosition,
    minusIconPosition,
    leftHandlePosition,
    rightHandlePosition,
    tooltipPosition,
  } = usePosition();

  return (
    <p
      data-testid="test-element"
      data-layout={layout}
      data-plusicon-position={plusIconPosition}
      data-minusicon-position={minusIconPosition}
      data-lefthandle-position={leftHandlePosition}
      data-righthandle-position={rightHandlePosition}
      data-tooltip-position={tooltipPosition}
    >
      This demo component will hold all the values from the usePosition hook
    </p>
  );
}
