import { AlertProvider } from '../layout';
import { SettingsModal } from './SettingsModal';
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
});
