import { KaotoToolbar } from './KaotoToolbar';
import { fetchDefaultNamespace } from '@kaoto/api';
import { AlertProvider } from '@kaoto/layout';
import { useSettingsStore } from '@kaoto/store';
import { act, fireEvent, render } from '@testing-library/react';

describe('KaotoToolbar.tsx', () => {
  test('component renders correctly', async () => {
    const wrapper = await act(async () =>
      render(
        <AlertProvider>
          <KaotoToolbar
            leftDrawerExpanded
            toggleCatalog={jest.fn()}
            toggleCodeEditor={jest.fn()}
            hideLeftPanel={jest.fn()}
          />
        </AlertProvider>,
      ),
    );

    const element = wrapper.getByTestId('viz-toolbar');
    expect(element).toBeInTheDocument();
  });

  test('logo renders correctly', async () => {
    const wrapper = await act(async () =>
      render(
        <AlertProvider>
          <KaotoToolbar
            leftDrawerExpanded
            toggleCatalog={jest.fn()}
            toggleCodeEditor={jest.fn()}
            hideLeftPanel={jest.fn()}
          />
        </AlertProvider>,
      ),
    );

    const element = wrapper.getByTestId('kaoto-logo');
    expect(element).toBeInTheDocument();
  });

  test('should fetch the default namespace', async () => {
    await act(async () =>
      render(
        <AlertProvider>
          <KaotoToolbar
            leftDrawerExpanded
            toggleCatalog={jest.fn()}
            toggleCodeEditor={jest.fn()}
            hideLeftPanel={jest.fn()}
          />
        </AlertProvider>,
      ),
    );

    expect(fetchDefaultNamespace).toHaveBeenCalled();
    expect(useSettingsStore.getState().settings.namespace).toBe('default');
  });

  test('open about modal', async () => {
    const wrapper = await act(async () =>
      render(
        <AlertProvider>
          <KaotoToolbar
            leftDrawerExpanded
            toggleCatalog={jest.fn()}
            toggleCodeEditor={jest.fn()}
            hideLeftPanel={jest.fn()}
          />
        </AlertProvider>,
      ),
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
