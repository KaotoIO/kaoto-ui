import { AlertProvider } from '../layout';
import { SettingsModal } from './SettingsModal';
import { fireEvent, screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('SettingsModal.tsx', () => {
  test('component renders if open', () => {
    render(
      <AlertProvider>
        <SettingsModal handleCloseModal={jest.fn()} isModalOpen={true} />
      </AlertProvider>
    );
    const element = screen.queryByTestId('settings-modal');
    expect(element).toBeInTheDocument();
  });

  test('component does not render if closed', () => {
    render(
      <AlertProvider>
        <SettingsModal handleCloseModal={jest.fn()} isModalOpen={false} />
      </AlertProvider>
    );
    const element = screen.queryByTestId('settings-modal');
    expect(element).not.toBeInTheDocument();
  });

  test('handleCloseModal is called', () => {
    const mockClose = jest.fn();

    render(
      <AlertProvider>
        <SettingsModal handleCloseModal={mockClose} isModalOpen={true} />
      </AlertProvider>
    );
    const saveButton = screen.getByTestId('settings-modal--save');
    fireEvent.click(saveButton);
    expect(mockClose).toHaveBeenCalled();
  });
});
