import { FlowsMenu } from './FlowsMenu';
import { useFlowsStore, useVisualizationStore } from '@kaoto/store';
import { act, fireEvent, render, waitFor } from '@testing-library/react';

describe('FlowsMenu.tsx', () => {
  beforeEach(() => {
    useFlowsStore.getState().deleteAllFlows();
    useFlowsStore.getState().addNewFlow('Integration', 'route-1234');
    useFlowsStore.getState().addNewFlow('Integration', 'route-4321');
  });

  test('should open the flows list when clicking the dropdown', async () => {
    const wrapper = render(<FlowsMenu />);
    const dropdown = await wrapper.findByTestId('flows-list-dropdown');

    /** Open List */
    act(() => {
      fireEvent.click(dropdown);
    });

    /** Wait for the List to appear */
    waitFor(() => {
      const flowsList = wrapper.queryByTestId('flows-list-table');
      expect(flowsList).toBeInTheDocument();
    });
  });

  test('should open the flows list when clicking the action button', async () => {
    const wrapper = render(<FlowsMenu />);
    const dropdown = await wrapper.findByTestId('flows-list-btn');

    /** Open List */
    act(() => {
      fireEvent.click(dropdown);
    });

    /** Wait for the List to appear */
    waitFor(() => {
      const flowsList = wrapper.queryByTestId('flows-list-table');
      expect(flowsList).toBeInTheDocument();
    });
  });

  test('should close the flows list when pressing ESC', async () => {
    const wrapper = render(<FlowsMenu />);
    const dropdown = await wrapper.findByTestId('flows-list-btn');

    /** Open List */
    act(() => {
      fireEvent.click(dropdown);
    });

    const flowsList = await wrapper.findByTestId('flows-list-table');
    /** Press Escape key to close the menu */
    act(() => {
      fireEvent.focus(flowsList);
      fireEvent.keyDown(flowsList, { key: 'Escape', code: 'Escape', charCode: 27 });
    });

    /** Wait for the List to appear */
    waitFor(() => {
      expect(flowsList).not.toBeInTheDocument();
    });
  });

  test('should render the route id when a single route is visible', async () => {
    const wrapper = render(<FlowsMenu />);
    const routeId = await wrapper.findByTestId('flows-list-route-id');

    act(() => {
      useVisualizationStore.getState().hideAllFlows();
      useVisualizationStore.getState().toggleFlowVisible('route-4321', true);
    });

    expect(routeId).toHaveTextContent('route-4321');
  });

  test('should NOT render the route id but "Routes" when there is no flow visible', async () => {
    const wrapper = render(<FlowsMenu />);
    const routeId = await wrapper.findByTestId('flows-list-route-id');

    act(() => {
      useVisualizationStore.getState().hideAllFlows();
    });

    expect(routeId).toHaveTextContent('Routes');
  });

  test('should NOT render the route id but "Routes" when there is more than 1 flow visible', async () => {
    const wrapper = render(<FlowsMenu />);
    const routeId = await wrapper.findByTestId('flows-list-route-id');

    act(() => {
      useVisualizationStore.getState().showAllFlows();
    });

    expect(routeId).toHaveTextContent('Routes');
  });

  test('should render the visible routes count', async () => {
    const wrapper = render(<FlowsMenu />);
    const routeCount = await wrapper.findByTestId('flows-list-route-count');

    act(() => {
      useVisualizationStore.getState().hideAllFlows();
      useVisualizationStore.getState().toggleFlowVisible('route-4321', true);
    });

    expect(routeCount).toHaveTextContent('1/2');
  });
});
