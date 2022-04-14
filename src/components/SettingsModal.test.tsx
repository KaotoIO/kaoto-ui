import { SettingsModal } from './SettingsModal';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('SettingsModal.tsx', () => {
  test('component renders correctly', () => {
    const initialSettings = {
      dsl: 'KameletBinding',
      integrationName: 'A super cool integration',
      namespace: 'default',
    };

    render(
      <SettingsModal
        currentSettings={initialSettings}
        handleCloseModal={jest.fn()}
        handleSaveSettings={jest.fn()}
        isModalOpen={false}
      />
    );
    const element = screen.getByTestId('settings-modal');
    expect(element).toBeInTheDocument();
  });
});
