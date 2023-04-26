import KaotoToolbar from './KaotoToolbar';
import { AlertProvider } from '@kaoto/layout';
import { screen, render, fireEvent, act } from '@testing-library/react';

describe('KaotoToolbar.tsx', () => {
  test('component renders correctly', () => {
    render(
      <AlertProvider>
        <KaotoToolbar
          leftDrawerExpanded
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
          leftDrawerExpanded
          toggleCatalog={jest.fn()}
          toggleCodeEditor={jest.fn()}
          hideLeftPanel={jest.fn()}
        />
      </AlertProvider>
    );
    const element = screen.getByTestId('kaoto-logo');
    expect(element).toBeInTheDocument();
  });

  test('open about modal', async () => {
    const wrapper = render(
      <AlertProvider>
        <KaotoToolbar
          leftDrawerExpanded
          toggleCatalog={jest.fn()}
          toggleCodeEditor={jest.fn()}
          hideLeftPanel={jest.fn()}
        />
      </AlertProvider>
    );

    const kebabDropdownMenu = wrapper.getByTestId('toolbar-kebab-dropdown-toggle');
    await act(async () => {
      fireEvent.click(kebabDropdownMenu);
    });

    const aboutMenuItem = wrapper.getByTestId('kaotoToolbar-kebab__about');
    await act(async () => {
      fireEvent.click(aboutMenuItem);
    });

    const aboutModal = wrapper.getByTestId('about-modal');
    expect(aboutModal).toBeInTheDocument();
  });
});
