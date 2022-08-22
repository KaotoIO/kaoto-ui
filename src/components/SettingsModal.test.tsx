import { AlertProvider } from '../layout';
import { SettingsModal } from './SettingsModal';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('SettingsModal.tsx', () => {
  test('component renders correctly', () => {
    render(
      <AlertProvider>
        <SettingsModal handleCloseModal={jest.fn()} isModalOpen={false} />
      </AlertProvider>
    );
    const element = screen.getByTestId('settings-modal');
    expect(element).toBeInTheDocument();
  });
});
