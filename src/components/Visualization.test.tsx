import { IIntegrationJsonStore, RFState, useIntegrationJsonStore, useVisualizationStore } from '@kaoto/store';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { AlertProvider } from '../layout';
import { integrationJSONStub, stepsStub } from '../stubs/steps';
import { Visualization } from './Visualization';

beforeAll(() => {
  // Setup ResizeObserver and offset* properties
  // see: https://github.com/wbkd/react-flow/issues/716

  window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));

  Object.defineProperties(window.HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return parseFloat(this.style.height) || 1;
      },
    },
    offsetWidth: {
      get() {
        return parseFloat(this.style.width) || 1;
      },
    },
  });

  (window.SVGElement as any).prototype.getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 });
});

describe('Visualization.tsx', () => {
  test('component renders correctly', async () => {
    act(() => {
      render(
        <AlertProvider>
          <Visualization />
        </AlertProvider>
      );
    });

    await waitFor(() => {
      const element = screen.getByTestId('react-flow-wrapper');
      expect(element).toBeInTheDocument();
    });
  });

  test('should expands the details panel upon clicking on a step', async () => {
    useVisualizationStore.setState(stepsStub as unknown as RFState);
    useIntegrationJsonStore.setState(integrationJSONStub as unknown as IIntegrationJsonStore);

    const wrapper = render(
      <AlertProvider>
        <Visualization />
      </AlertProvider>
    );

    const stepIcon = wrapper.getByTestId('viz-step-timer-source').querySelector('.stepNode__Icon.stepNode__clickable') as HTMLDivElement;

    fireEvent.click(stepIcon);

    const drawer = wrapper.container.querySelector('#right-resize-panel');

    await waitFor(() => {
      expect(drawer?.getAttribute('data-expanded')).toEqual('true');
    });
  });
});
