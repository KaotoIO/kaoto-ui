import { act, render, screen, waitFor } from '@testing-library/react';
import { AlertProvider } from '../layout';
import { MiniCatalog } from './MiniCatalog';

describe('MiniCatalog.tsx', () => {
  test('component renders correctly', async () => {
    act(() => {
      render(
        <AlertProvider>
          <MiniCatalog />
        </AlertProvider>
      );
    });

    await waitFor(() => {
      const element = screen.getByTestId('miniCatalog');
      expect(element).toBeInTheDocument();

      const startButton = screen.getByText('start');
      expect(startButton).toBeInTheDocument();
    });
  });
});
