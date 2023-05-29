import { capabilitiesStub } from '../../stubs';
import { DSLSelector } from './DSLSelector';
import { useSettingsStore } from '@kaoto/store';
import { IDsl } from '@kaoto/types';
import { act, fireEvent, render, waitFor } from '@testing-library/react';

describe('DSLSelector.tsx', () => {
  let onSelect: jest.Mock;
  const dsl: IDsl = {
    name: 'Capability 1',
    deployable: '',
    description: '',
    input: '',
    output: '',
    stepKinds: '',
    validationSchema: '',
  };

  beforeEach(() => {
    onSelect = jest.fn();

    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        capabilities: capabilitiesStub.dsls,
      },
    });
  });

  test('component renders', () => {
    const wrapper = render(<DSLSelector onSelect={onSelect} />);

    const toggle = wrapper.queryByTestId('dsl-select');
    expect(toggle).toBeInTheDocument();
  });

  test('should toggle list of DSLs', async () => {
    const wrapper = render(<DSLSelector onSelect={onSelect} />);
    const toggle = await wrapper.findByTestId('dsl-select');

    /** Open Select */
    act(() => {
      fireEvent.click(toggle);
    });

    const element = wrapper.getByText('Integration');
    expect(element).toBeInTheDocument();

    /** Close Select */
    act(() => {
      fireEvent.click(toggle);
    });

    expect(element).not.toBeInTheDocument();
  });

  test('should show list of DSLs', async () => {
    const wrapper = render(<DSLSelector onSelect={onSelect} />);
    const toggle = await wrapper.findByTestId('dsl-select');

    /** Open Select */
    act(() => {
      fireEvent.click(toggle);
    });

    const element = await wrapper.findByText('Integration');
    expect(element).toBeInTheDocument();
  });

  test('should show selected value', async () => {
    const wrapper = render(<DSLSelector onSelect={onSelect} selectedDsl={dsl} />);
    const toggle = await wrapper.findByTestId('dsl-select');

    /** Open Select */
    act(() => {
      fireEvent.click(toggle);
    });

    /** Click on first element */
    act(() => {
      const element = wrapper.getByText('Integration');
      fireEvent.click(element);
    });

    /** Open Select again */
    act(() => {
      fireEvent.click(toggle);
    });

    const element = await wrapper.findByRole('option', { selected: true });
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Integration');
  });

  test('should not have anything selected if "isStatic=true"', async () => {
    const wrapper = render(<DSLSelector onSelect={onSelect} isStatic />);
    const toggle = await wrapper.findByTestId('dsl-select');

    /** Open Select */
    act(() => {
      fireEvent.click(toggle);
    });

    /** Click on first element */
    act(() => {
      const element = wrapper.getByText('Integration');
      fireEvent.click(element);
    });

    /** Open Select again */
    act(() => {
      fireEvent.click(toggle);
    });

    waitFor(() => {
      const element = wrapper.queryByRole('option', { selected: true });
      expect(element).not.toBeInTheDocument();
    });
  });

  test('should have selected DSL if provided', async () => {
    const wrapper = render(
      <DSLSelector onSelect={onSelect} selectedDsl={capabilitiesStub.dsls[2]} />,
    );
    const toggle = await wrapper.findByTestId('dsl-select');

    /** Open Select */
    act(() => {
      fireEvent.click(toggle);
    });

    waitFor(() => {
      const element = wrapper.queryByRole('option', { selected: true });
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent('Kamelet');
    });
  });

  test('should have selected the first DSL if selectedDsl is not provided', async () => {
    const wrapper = render(<DSLSelector onSelect={onSelect} />);
    const toggle = await wrapper.findByTestId('dsl-select');

    /** Open Select */
    act(() => {
      fireEvent.click(toggle);
    });

    waitFor(() => {
      const element = wrapper.queryByRole('option', { selected: true });
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent('Integration');
    });
  });

  test('should close Select when pressing ESC', async () => {
    const wrapper = render(<DSLSelector onSelect={onSelect} />);
    const toggle = await wrapper.findByTestId('dsl-select');

    /** Open Select */
    act(() => {
      fireEvent.click(toggle);
    });

    const menu = await wrapper.findByRole('listbox');
    /** Press Escape key to close the menu */
    act(() => {
      fireEvent.focus(menu);
      fireEvent.keyDown(menu, { key: 'Escape', code: 'Escape', charCode: 27 });
    });

    expect(menu).not.toBeInTheDocument();

    waitFor(() => {
      const element = wrapper.queryByRole('option', { selected: true });
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent('Integration');
    });
  });

  test('should call onSelect callback when provided', async () => {
    const wrapper = render(<DSLSelector onSelect={onSelect} isStatic />);
    const toggle = await wrapper.findByTestId('dsl-select');

    /** Open Select */
    act(() => {
      fireEvent.click(toggle);
    });

    /** Click on first element */
    act(() => {
      const element = wrapper.getByText('Integration');
      fireEvent.click(element);
    });

    waitFor(() => {
      expect(onSelect).toHaveBeenCalled();
    });
  });

  test('should not call onSelect spy when not provided', async () => {
    const wrapper = render(<DSLSelector onSelect={undefined} isStatic />);
    const toggle = await wrapper.findByTestId('dsl-select');

    /** Open Select */
    act(() => {
      fireEvent.click(toggle);
    });

    /** Click on first element */
    act(() => {
      const element = wrapper.getByText('Integration');
      fireEvent.click(element);
    });

    waitFor(() => {
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  test('should not call onSelect spy when the selected id does not exist', async () => {
    const wrapper = render(<DSLSelector onSelect={onSelect} isStatic />);
    const toggle = await wrapper.findByTestId('dsl-select');

    /** Open Select */
    act(() => {
      fireEvent.click(toggle);
    });

    /** Forcing a non existing key. We're using splice since modifies the Array without triggering a store update */
    useSettingsStore.getState().settings.capabilities.splice(0, Number.POSITIVE_INFINITY);

    /** Click on first element */
    act(() => {
      const element = wrapper.getByText('Integration');
      fireEvent.click(element);
    });

    waitFor(() => {
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  test('should render children components', async () => {
    const wrapper = render(
      <DSLSelector>
        <p>This is a child component</p>
      </DSLSelector>,
    );

    waitFor(() => {
      const child = wrapper.getByText('This is a child component');
      expect(child).toBeInTheDocument();
    });
  });
});
