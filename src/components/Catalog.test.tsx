import { Catalog } from './Catalog';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('Catalog.tsx', () => {
  test('component renders correctly', () => {
    render(<Catalog isCatalogExpanded={true} onClosePanelClick={jest.fn()} />);

    const element = screen.getByTestId('stepCatalog');
    expect(element).toBeInTheDocument();
  });
});
