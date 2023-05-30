import { MetadataEditorModal } from './MetadataEditorModal';
import { schemaMock } from './MetadataEditorModal.stories';
import { screen } from '@testing-library/dom';
import { fireEvent, render, waitFor } from '@testing-library/react';

describe('MetadataEditorModal.tsx', () => {
  test('component renders if open', () => {
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={true}
        name="beans"
        schema={schemaMock.beans}
      />,
    );
    const element = screen.queryByTestId('metadata-beans-modal');
    expect(element).toBeInTheDocument();
  });

  test('component does not render if closed', () => {
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={false}
        name="beans"
        schema={schemaMock.beans}
      />,
    );
    const element = screen.queryByTestId('metadata-beans-modal');
    expect(element).not.toBeInTheDocument();
  });

  test('editor works', async () => {
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={true}
        name="beans"
        schema={schemaMock.beans}
      />,
    );
    const inputs = screen
      .getAllByTestId('text-field')
      .filter((input) => input.getAttribute('name') === 'name');
    expect(inputs.length).toBe(1);
    expect(inputs[0]).toBeDisabled();
    const addPropsBtn = screen.getByTestId('properties-add-property--popover-btn');
    expect(addPropsBtn).toBeDisabled();
    screen.getByText('No beans');

    const addBeansBtns = screen.getAllByTestId('metadata-add-beans-btn');
    expect(addBeansBtns.length).toBe(2);
    fireEvent.click(addBeansBtns[1]);
    const noBeans2 = screen.queryByText('No beans');
    expect(noBeans2).not.toBeInTheDocument();
    const inputs2 = screen
      .getAllByTestId('text-field')
      .filter((input) => input.getAttribute('name') === 'name');
    expect(inputs2.length).toBe(1);
    expect(inputs2[0]).toBeEnabled();
    screen.getByText('No properties');

    const addPropsBtns = screen.getAllByTestId('properties-add-property--popover-btn');
    expect(addPropsBtns.length).toBe(2);
    fireEvent.click(addPropsBtns[1]);
    await waitFor(() => screen.getByTestId('properties-add-property--popover'));
    const propNameInput = screen.getByTestId('properties-add-property--name-input');
    fireEvent.input(propNameInput, { target: { value: 'propObj' } });
    const propTypeObjectRadio = screen.getByTestId('properties-add-property--type-object');
    fireEvent.click(propTypeObjectRadio);
    const propAddBtn = screen.getByTestId('properties-add-property--add-btn');
    fireEvent.click(propAddBtn);

    const addPropsPropObjBtn = await waitFor(() =>
      screen.getByTestId('properties-add-property-propObj-popover-btn'),
    );
    fireEvent.click(addPropsPropObjBtn);
    const propNamePropObjInput = await waitFor(() =>
      screen.getByTestId('properties-add-property-propObj-name-input'),
    );
    fireEvent.input(propNamePropObjInput, { target: { value: 'subPropName' } });
    const propValueInput = screen.getByTestId('properties-add-property-propObj-value-input');
    fireEvent.input(propValueInput, { target: { value: 'subPropValue' } });
    const propAddBtn2 = screen.getByTestId('properties-add-property-propObj-add-btn');
    fireEvent.click(propAddBtn2);
    const noProps2 = screen.queryByText('No properties');
    expect(noProps2).not.toBeInTheDocument();

    const expandBtn = screen.getByLabelText('Expand row 0');
    fireEvent.click(expandBtn);
    const subPropInput = await waitFor(() =>
      screen.getByTestId('properties-propObj-subPropName-value-input'),
    );
    fireEvent.input(subPropInput, { target: { value: 'subPropValueModified' } });

    const deletePropObjBtn = screen.getByTestId('properties-delete-property-propObj-btn');
    fireEvent.click(deletePropObjBtn);
    const deletePropObjBtn2 = screen.queryByTestId('properties-delete-property-propObj-btn');
    expect(deletePropObjBtn2).not.toBeInTheDocument();
    screen.getByText('No properties');
    const deleteBeansBtn = screen.getByTestId('metadata-delete-0-btn');
    fireEvent.click(deleteBeansBtn);
    const deleteBeansBtn2 = screen.queryByTestId('metadata-delete-0-btn');
    expect(deleteBeansBtn2).not.toBeInTheDocument();
    screen.getByText('No beans');
  });
});
