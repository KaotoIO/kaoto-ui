import { AlertProvider } from '../layout';
import { capabilitiesStub } from '../stubs';
import { integrationJSONStub, stepsStub } from '../stubs/steps';
import { Visualization } from './Visualization';
import { fetchCapabilities, fetchIntegrationSourceCode, fetchViews } from '@kaoto/api';
import { RFState, useFlowsStore, useVisualizationStore } from '@kaoto/store';
import { IFlowsWrapper } from '@kaoto/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

jest.mock('@kaoto/api', () => {
  const actual = jest.requireActual('@kaoto/api');

  return {
    ...actual,
    fetchViews: jest.fn(),
    fetchCapabilities: jest.fn(),
    fetchIntegrationSourceCode: jest.fn(),
  };
});

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

  jest.mocked(fetchCapabilities).mockResolvedValue(capabilitiesStub);
  jest.mocked(fetchIntegrationSourceCode).mockResolvedValue('');
  jest.mocked(fetchViews).mockResolvedValue([]);
});

beforeEach(() => {
  useFlowsStore.getState().deleteAllFlows();
  useFlowsStore.getState().addNewFlow('Integration');
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Visualization.tsx', () => {
  test('component renders correctly', async () => {
    act(() => {
      render(
        <AlertProvider>
          <Visualization />
        </AlertProvider>,
      );
    });

    await waitFor(() => {
      const element = screen.getByTestId('react-flow-wrapper');
      expect(element).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should render the empty state when there are no flows', async () => {
      useFlowsStore.getState().deleteAllFlows();

      act(() => {
        render(
          <AlertProvider>
            <Visualization />
          </AlertProvider>,
        );
      });

      await waitFor(() => {
        const element = screen.getByTestId('visualization-empty-state');
        expect(element).toBeInTheDocument();
      });
    });

    it('should not render the empty state when there are at least one flow', async () => {
      await act(async () => {
        render(
          <AlertProvider>
            <Visualization />
          </AlertProvider>,
        );
      });

      const element = screen.queryByTestId('visualization-empty-state');
      expect(element).not.toBeInTheDocument();
    });
  });

  test('should expands the details panel upon clicking on a step', async () => {
    useVisualizationStore.setState(stepsStub as unknown as RFState);
    useFlowsStore.setState({
      flows: [integrationJSONStub],
      properties: {},
      views: [],
    } as unknown as IFlowsWrapper);

    const wrapper = render(
      <AlertProvider>
        <Visualization />
      </AlertProvider>,
    );

    const stepIcon = wrapper
      .getByTestId('viz-step-timer-source')
      .querySelector('.stepNode__Icon.stepNode__clickable') as HTMLDivElement;

    fireEvent.click(stepIcon);

    const drawer = wrapper.container.querySelector('#right-resize-panel');

    await waitFor(() => {
      expect(drawer?.getAttribute('data-expanded')).toEqual('true');
    });
  });
});
