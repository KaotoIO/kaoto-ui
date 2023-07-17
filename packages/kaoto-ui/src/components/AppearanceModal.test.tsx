import { AlertProvider } from '../layout';
import { AppearanceModal } from './AppearanceModal';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('AppearanceModal.tsx', () => {
  test('component renders if open', () => {
    render(
      <AlertProvider>
        <AppearanceModal handleCloseModal={jest.fn()} isModalOpen={true} />
      </AlertProvider>,
    );
    const element = screen.queryByTestId('appearance-modal');
    expect(element).toBeInTheDocument();
  });

  test('component does not render if closed', () => {
    render(
      <AlertProvider>
        <AppearanceModal handleCloseModal={jest.fn()} isModalOpen={false} />
      </AlertProvider>,
    );
    const element = screen.queryByTestId('appearance-modal');
    expect(element).not.toBeInTheDocument();
  });
});
