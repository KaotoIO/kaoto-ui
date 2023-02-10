import { AlertProvider } from '../layout';
import { MiniCatalog } from './MiniCatalog';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('MiniCatalog.tsx', () => {
  test('component renders correctly', () => {
    render(
      <AlertProvider>
        <MiniCatalog />
      </AlertProvider>
    );

    const element = screen.getByTestId('miniCatalog');
    expect(element).toBeInTheDocument();
  });
  test('component renders correctly', () => {
    render(
      <AlertProvider>
        <MiniCatalog />
      </AlertProvider>
    );

    const element = screen.getByText('start');
    expect(element).toBeInTheDocument();
  });
});
