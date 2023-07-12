import { AlertProvider } from '../layout';
import { SettingsModal } from './SettingsModal';
import { WithNameDesc } from './SettingsModal.stories';
import { useFlowsStore } from '@kaoto/store';
import { fireEvent } from '@testing-library/dom';
import { act, render } from '@testing-library/react';

describe('SettingsModal.tsx', () => {
  test('component renders if open', async () => {
    const wrapper = await act(async () =>
      render(
        <AlertProvider>
          <SettingsModal handleCloseModal={jest.fn()} isModalOpen={true} />
        </AlertProvider>,
      ),
    );
    const element = wrapper.queryByTestId('settings-modal');
    expect(element).toBeInTheDocument();
  });

  test('component does not render if closed', async () => {
    const wrapper = await act(async () =>
      render(
        <AlertProvider>
          <SettingsModal handleCloseModal={jest.fn()} isModalOpen={false} />
        </AlertProvider>,
      ),
    );
    const element = wrapper.queryByTestId('settings-modal');
    expect(element).not.toBeInTheDocument();
  });

  test('handleCloseModal is called', async () => {
    const mockClose = jest.fn();

    const wrapper = await act(async () =>
      render(
        <AlertProvider>
          <SettingsModal handleCloseModal={mockClose} isModalOpen={true} />
        </AlertProvider>,
      ),
    );

    await act(async () => {
      const saveButton = wrapper.getByTestId('settings-modal--save');
      fireEvent.click(saveButton);
    });

    expect(mockClose).toHaveBeenCalled();
  });

  test('Name and Description are saved', async () => {
    const mockClose = jest.fn();
    const wrapper = await act(async () =>
      render(<WithNameDesc handleCloseModal={mockClose} isModalOpen={true} />),
    );

    await act(async () => {
      useFlowsStore.getState().metadata = {};
      const nameInput = wrapper.getByTestId('settings--integration-name');
      fireEvent.change(nameInput, { target: { value: 'test-name' } });
      const descInput = wrapper.getByTestId('settings--integration-description');
      fireEvent.change(descInput, { target: { value: 'test description' } });
      const saveButton = wrapper.getByTestId('settings-modal--save');
      fireEvent.click(saveButton);
    });
    expect(useFlowsStore.getState().metadata.name).toBe('test-name');
    expect(useFlowsStore.getState().metadata.description).toBe('test description');
  });

  test('Name and Description are not saved with cancel button', async () => {
    const mockClose = jest.fn();
    const wrapper = await act(async () =>
      render(<WithNameDesc handleCloseModal={mockClose} isModalOpen={true} />),
    );

    await act(async () => {
      useFlowsStore.getState().metadata = {};
      const nameInput = wrapper.getByTestId('settings--integration-name');
      fireEvent.change(nameInput, { target: { value: 'test-name' } });
      const descInput = wrapper.getByTestId('settings--integration-description');
      fireEvent.change(descInput, { target: { value: 'test description' } });
      const cancelButton = wrapper.getByTestId('settings-modal--cancel');
      fireEvent.click(cancelButton);
    });
    expect(useFlowsStore.getState().metadata.name).toBeFalsy();
    expect(useFlowsStore.getState().metadata.description).toBeFalsy();
  });
});
