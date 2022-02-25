import { MiniCatalog } from './MiniCatalog';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('MiniCatalog.tsx', () => {
  test('component renders correctly', () => {
    render(<MiniCatalog />);

    const element = screen.getByTestId('miniCatalog');
    expect(element).toBeInTheDocument();
  });
});
