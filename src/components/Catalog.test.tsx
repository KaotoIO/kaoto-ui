import { Catalog } from './Catalog';
import { AlertProvider } from './MASAlerts';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('Catalog.tsx', () => {
  test('component renders correctly', () => {
    render(
      <AlertProvider>
        <Catalog isCatalogExpanded={true} onClosePanelClick={jest.fn()} />
      </AlertProvider>
    );

    const element = screen.getByTestId('stepCatalog');
    expect(element).toBeInTheDocument();
  });
});
