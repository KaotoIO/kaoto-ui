import { MetadataEditorModal } from './MetadataEditorModal';
import { mockModel, mockSchema } from './TestUtil';
import { useFlowsStore } from '@kaoto/store';
import { screen } from '@testing-library/dom';
import { fireEvent, render } from '@testing-library/react';

describe('MetadataEditorModal.tsx', () => {
  test('component renders if open', () => {
    useFlowsStore.getState().setMetadata('beans', []);
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={true}
        name="beans"
        schema={mockSchema.beans}
      />,
    );
    const element = screen.queryByTestId('metadata-beans-modal');
    expect(element).toBeInTheDocument();
  });

  test('component does not render if closed', () => {
    useFlowsStore.getState().setMetadata('beans', []);
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={false}
        name="beans"
        schema={mockSchema.beans}
      />,
    );
    const element = screen.queryByTestId('metadata-beans-modal');
    expect(element).not.toBeInTheDocument();
  });

  test('Details disabled if empty', async () => {
    useFlowsStore.getState().setMetadata('beans', []);
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={true}
        name="beans"
        schema={mockSchema.beans}
      />,
    );
    const inputs = screen
      .getAllByTestId('text-field')
      .filter((input) => input.getAttribute('name') === 'name');
    expect(inputs.length).toBe(1);
    expect(inputs[0]).toBeDisabled();
    const addStringPropBtn = screen.getByTestId('properties-add-string-property--btn');
    expect(addStringPropBtn).toBeDisabled();
    const addObjectPropBtn = screen.getByTestId('properties-add-object-property--btn');
    expect(addObjectPropBtn).toBeDisabled();
  });

  test('Details enabled if select', async () => {
    useFlowsStore.getState().setMetadata('beans', mockModel.beans);
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={true}
        name="beans"
        schema={mockSchema.beans}
      />,
    );
    const row = screen.getByTestId('metadata-row-0');
    fireEvent.click(row);
    const inputs = screen
      .getAllByTestId('text-field')
      .filter((input) => input.getAttribute('name') === 'name');
    expect(inputs.length).toBe(1);
    expect(inputs[0]).toBeEnabled();
    const addStringPropBtn = screen.getByTestId('properties-add-string-property--btn');
    expect(addStringPropBtn).toBeEnabled();
    const addObjectPropBtn = screen.getByTestId('properties-add-object-property--btn');
    expect(addObjectPropBtn).toBeEnabled();
    const propObj2AddStringPropBtn = screen.getByTestId(
      'properties-add-string-property-propObj1-btn',
    );
    fireEvent.click(propObj2AddStringPropBtn);
    const input = screen.getByTestId('properties-propObj1-placeholder-name-input');
    fireEvent.input(input, { target: { value: 'propObj1Child' } });
    fireEvent.blur(input);
  });

  test('render properties empty state', async () => {
    useFlowsStore.getState().setMetadata('beans', mockModel.beansNoProp);
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={true}
        name="beans"
        schema={mockSchema.beans}
      />,
    );
    const row = screen.getByTestId('metadata-row-0');
    fireEvent.click(row);
    let addStringPropBtns = screen.getAllByTestId('properties-add-string-property--btn');
    expect(addStringPropBtns.length).toBe(2);
    fireEvent.click(addStringPropBtns[1]);
    addStringPropBtns = screen.getAllByTestId('properties-add-string-property--btn');
    expect(addStringPropBtns.length).toBe(1);
  });
});
