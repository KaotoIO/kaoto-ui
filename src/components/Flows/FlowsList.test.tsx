import { FlowsService } from '../../services/FlowsService';
import { FlowsList } from './FlowsList';
import { useFlowsStore, useVisualizationStore } from '@kaoto/store';
import { act, fireEvent, render } from '@testing-library/react';

describe('FlowsList.tsx', () => {
  beforeEach(() => {
    useFlowsStore.getState().deleteAllFlows();

    jest.spyOn(FlowsService, 'getNewFlowId').mockReturnValueOnce('route-1234');
    jest.spyOn(FlowsService, 'getNewFlowId').mockReturnValueOnce('route-4321');
    useFlowsStore.getState().addNewFlow('Integration');
    useFlowsStore.getState().addNewFlow('Integration');
  });

  test('should render the existing flows', async () => {
    const wrapper = render(<FlowsList />);
    const flows = await wrapper.findAllByTestId(/flows-list-row-*/);

    expect(flows).toHaveLength(2);
  });

  test('should display an empty state when there is no routes available', async () => {
    useFlowsStore.getState().deleteAllFlows();
    const wrapper = render(<FlowsList />);

    const emptyState = await wrapper.findByTestId('flows-list-empty-state');

    expect(emptyState).toBeInTheDocument();
  });

  test('should render the flows ids', async () => {
    const wrapper = render(<FlowsList />);
    const flow1 = await wrapper.findByText('route-1234');
    const flow2 = await wrapper.findByText('route-4321');

    expect(flow1).toBeInTheDocument();
    expect(flow2).toBeInTheDocument();
  });

  test('should make the selected flow visible by clicking on its ID', async () => {
    const wrapper = render(<FlowsList />);
    const flowId = await wrapper.findByTestId('goto-btn-route-1234');

    act(() => {
      fireEvent.click(flowId);
    });

    expect(useVisualizationStore.getState().visibleFlows).toEqual({
      'route-1234': true,
      'route-4321': false,
    });
  });

  test('should call onClose when clicking on a flow ID', async () => {
    const onCloseSpy = jest.fn();
    const wrapper = render(<FlowsList onClose={onCloseSpy} />);
    const flowId = await wrapper.findByTestId('goto-btn-route-1234');

    act(() => {
      fireEvent.click(flowId);
    });

    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  test('should toggle the visibility of a flow clicking on the Eye icon', async () => {
    useVisualizationStore.getState().hideAllFlows();
    const wrapper = render(<FlowsList />);
    const toggleFlowId = await wrapper.findByTestId('toggle-btn-route-1234');

    act(() => {
      fireEvent.click(toggleFlowId);
    });

    expect(useVisualizationStore.getState().visibleFlows).toEqual({
      'route-1234': true,
      'route-4321': false,
    });
  });

  test('should render the appropiate Eye icon', async () => {
    useVisualizationStore.getState().hideAllFlows();
    const wrapper = render(<FlowsList />);
    const toggleFlowId = await wrapper.findByTestId('toggle-btn-route-1234');

    act(() => {
      fireEvent.click(toggleFlowId);
    });

    /** Eye icon */
    const flow1 = await wrapper.findByTestId('toggle-btn-route-1234-visible');
    expect(flow1).toBeInTheDocument();

    /** Eye slash icon */
    const flow2 = await wrapper.findByTestId('toggle-btn-route-4321-hidden');
    expect(flow2).toBeInTheDocument();
  });

  test('should allow to delete a flow clicking on the Trash icon', async () => {
    useVisualizationStore.getState().hideAllFlows();
    const wrapper = render(<FlowsList />);
    const deleteFlowId = await wrapper.findByTestId('delete-btn-route-1234');

    act(() => {
      fireEvent.click(deleteFlowId);
    });

    expect(useFlowsStore.getState().flows).toHaveLength(1);
    expect(useFlowsStore.getState().flows[0].id).toEqual('route-4321');
  });

  test('should allow the user to edit a flow name', async () => {
    const wrapper = render(<FlowsList />);

    act(() => {
      const editFlowId = wrapper.getByTestId('goto-btn-route-4321--edit');
      fireEvent.click(editFlowId);
    });

    act(() => {
      const input = wrapper.getByTestId('goto-btn-route-4321--text-input');
      fireEvent.change(input, { target: { value: 'new-name' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    expect(useFlowsStore.getState().flows[1].id).toEqual('new-name');
  });
});
