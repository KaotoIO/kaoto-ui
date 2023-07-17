import { AppLayout } from './AppLayout';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

describe('AppLayout.tsx', () => {
  test('component renders correctly', async () => {
    act(() => {
      render(
        <AppLayout>
          <span data-testid="children">This is a placeholder</span>
        </AppLayout>,
      );
    });

    await waitFor(() => {
      const element = screen.getByTestId('children');
      expect(element).toBeInTheDocument();
    });
  });
});
