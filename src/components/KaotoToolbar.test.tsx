import KaotoToolbar from './KaotoToolbar';
import { AlertProvider } from '@kaoto/layout';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('KaotoToolbar.tsx', () => {
  test('component renders correctly', () => {
    render(
      <AlertProvider>
        <KaotoToolbar
          toggleCatalog={jest.fn()}
          toggleCodeEditor={jest.fn()}
          hideLeftPanel={jest.fn()}
        />
      </AlertProvider>
    );
    const element = screen.getByTestId('viz-toolbar');
    expect(element).toBeInTheDocument();
  });

  test('logo renders correctly', () => {
    render(
      <AlertProvider>
        <KaotoToolbar
          toggleCatalog={jest.fn()}
          toggleCodeEditor={jest.fn()}
          hideLeftPanel={jest.fn()}
        />
      </AlertProvider>
    );
    const element = screen.getByTestId('kaoto-logo');
    expect(element).toBeInTheDocument();
  });
});
