import { AlertProvider } from '../layout';
import { Catalog } from './Catalog';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('Catalog.tsx', () => {
  test('component renders correctly', () => {
    render(
      <AlertProvider>
        <Catalog handleClose={jest.fn()} />
      </AlertProvider>
    );

    const element = screen.getByTestId('stepCatalog');
    expect(element).toBeInTheDocument();
  });
});
