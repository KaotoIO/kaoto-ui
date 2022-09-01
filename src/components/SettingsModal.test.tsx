import { AlertProvider } from '../layout';
import { SettingsModal } from './SettingsModal';
import { screen } from '@testing-library/dom';
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
});
