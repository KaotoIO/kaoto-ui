import { AlertProvider } from '../layout';
import { AppearanceModal } from './AppearanceModal';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('AppearanceModal.tsx', () => {
  test('component renders correctly', () => {
    render(
      <AlertProvider>
        <AppearanceModal handleCloseModal={jest.fn()} isModalOpen={false} />
      </AlertProvider>
    );
    const element = screen.getByTestId('appearance-modal');
    expect(element).toBeInTheDocument();
  });
});
