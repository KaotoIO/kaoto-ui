import { AlertProvider } from '../layout';
import { StepsService } from '../services/stepsService';
import { VisualizationService } from '../services/visualizationService';
import { flowWithBranch } from '../stubs';
import { integrationJSONStub, stepsStub } from '../stubs/steps';
import { Visualization } from './Visualization';
import { fetchIntegrationSourceCode } from '@kaoto/api';
import { RFState, useFlowsStore, useVisualizationStore } from '@kaoto/store';
import { IFlowsWrapper } from '@kaoto/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

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

  it('should sync the source code upon adding a flow', async () => {
    useFlowsStore.getState().deleteAllFlows();

    act(() => {
      render(
        <AlertProvider>
          <Visualization />
        </AlertProvider>,
      );
    });

    act(() => {
      (fetchIntegrationSourceCode as jest.Mock).mockClear();
      useFlowsStore.getState().addNewFlow('Camel Route');
    });

    await waitFor(() => {
      expect(fetchIntegrationSourceCode).toHaveBeenCalledTimes(1);
      expect(fetchIntegrationSourceCode).toHaveBeenCalledWith(
        {
          flows: [
            {
              description: '',
              dsl: 'Camel Route',
              id: expect.any(String),
              metadata: { name: expect.any(String) },
              params: [],
              steps: [],
            },
          ],
          metadata: {},
          properties: {},
        },
        '',
      );
    });
  });

  describe('selecting a step', () => {
    it('should not call StepsService if the selectedStepUuid property is empty', async () => {
      const findStepWithUUIDSpy = jest.spyOn(StepsService.prototype, 'findStepWithUUID');

      act(() => {
        render(
          <AlertProvider>
            <Visualization />
          </AlertProvider>,
        );
      });

      await act(async () => {
        useFlowsStore.getState().addNewFlow('Camel Route');
      });

      await act(async () => {
        useVisualizationStore.setState({ selectedStepUuid: '' });
      });

      expect(findStepWithUUIDSpy).not.toHaveBeenCalled();
    });

    it.skip('should update the SelectedStep property if the step is found', async () => {
      jest
        .spyOn(StepsService.prototype, 'findStepWithUUID')
        .mockReturnValueOnce(flowWithBranch.steps[0]);
      const getEmptySelectedStepSpy = jest.spyOn(VisualizationService, 'getEmptySelectedStep');
      useFlowsStore.setState({ flows: [flowWithBranch] });

      act(() => {
        render(
          <AlertProvider>
            <Visualization />
          </AlertProvider>,
        );
      });

      await act(async () => {
        getEmptySelectedStepSpy.mockClear();
        useVisualizationStore.setState({ selectedStepUuid: 'route-1814_timer-0' });
      });

      expect(getEmptySelectedStepSpy).not.toHaveBeenCalled();
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
