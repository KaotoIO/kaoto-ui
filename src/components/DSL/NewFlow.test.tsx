import { capabilitiesStub } from '../../stubs';
import { NewFlow } from './NewFlow';
import { useFlowsStore, useSettingsStore } from '@kaoto/store';
import { act, fireEvent, render } from '@testing-library/react';

describe('NewFlow.tsx', () => {
  beforeEach(() => {
    useFlowsStore.getState().deleteAllFlows();
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        dsl: capabilitiesStub.dsls[0],
        capabilities: capabilitiesStub.dsls,
      },
    });
  });

  test('should add a new flow', async () => {
    const wrapper = render(<NewFlow />);
    const trigger = await wrapper.findByText('New route');

    /** Open Select */
    act(() => {
      fireEvent.click(trigger);
    });

    /** Select an option */
    act(() => {
      const element = wrapper.getByText('Integration');
      fireEvent.click(element);
    });

    expect(useFlowsStore.getState().flows).toHaveLength(1);
    expect(useFlowsStore.getState().flows[0].dsl).toEqual('Integration');
  });

  test('should warn the user when adding a different type of flow', async () => {
    useFlowsStore.getState().addNewFlow('Integration');

    const wrapper = render(<NewFlow />);
    const trigger = await wrapper.findByText('New route');

    /** Open Select */
    act(() => {
      fireEvent.click(trigger);
    });

    /** Select an option */
    act(() => {
      const element = wrapper.getByText('Kamelet');
      fireEvent.click(element);
    });

    const modal = await wrapper.findByTestId('confirmation-modal');
    expect(modal).toBeInTheDocument();
  });

  test('should add a different type of flow', async () => {
    useFlowsStore.getState().addNewFlow('Integration');

    const wrapper = render(<NewFlow />);
    const trigger = await wrapper.findByText('New route');

    /** Open Select */
    act(() => {
      fireEvent.click(trigger);
    });

    /** Select an option */
    act(() => {
      const element = wrapper.getByText('Kamelet');
      fireEvent.click(element);
    });

    const confirmButton = await wrapper.findByText('Confirm', { selector: 'button' });
    act(() => {
      fireEvent.click(confirmButton);
    });

    expect(useFlowsStore.getState().flows).toHaveLength(1);
    expect(useFlowsStore.getState().flows[0].dsl).toEqual('Kamelet');
  });

  test('should not do anything if the user closes the modal', async () => {
    useFlowsStore.getState().addNewFlow('Integration');

    const wrapper = render(<NewFlow />);
    const trigger = await wrapper.findByText('New route');

    /** Open Select */
    act(() => {
      fireEvent.click(trigger);
    });

    /** Select an option */
    act(() => {
      const element = wrapper.getByText('Kamelet');
      fireEvent.click(element);
    });

    const cancelButton = await wrapper.findByText('Cancel', { selector: 'button' });
    act(() => {
      fireEvent.click(cancelButton);
    });

    expect(useFlowsStore.getState().flows).toHaveLength(1);
    expect(useFlowsStore.getState().flows[0].dsl).toEqual('Integration');
  });

  test('should not do anything if the user cancel the modal', async () => {
    useFlowsStore.getState().addNewFlow('Integration');

    const wrapper = render(<NewFlow />);
    const trigger = await wrapper.findByText('New route');

    /** Open Select */
    act(() => {
      fireEvent.click(trigger);
    });

    /** Select an option */
    act(() => {
      const element = wrapper.getByText('Kamelet');
      fireEvent.click(element);
    });

    const closeButton = await wrapper.findByLabelText('Close', { selector: 'button' });
    act(() => {
      fireEvent.click(closeButton);
    });

    expect(useFlowsStore.getState().flows).toHaveLength(1);
    expect(useFlowsStore.getState().flows[0].dsl).toEqual('Integration');
  });
});
