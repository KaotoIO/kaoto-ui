import { MetadataEditorModal } from './MetadataEditorModal';
import { mockModel, mockSchema } from './TestUtil';
import { useFlowsStore } from '@kaoto/store';
import { fireEvent, render, screen } from '@testing-library/react';
import cloneDeep from 'lodash.clonedeep';

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
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
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
  });

  test('render properties empty state', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beansNoProp));
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

  test('Add a bean and save', async () => {
    useFlowsStore.getState().setMetadata('beans', []);
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={true}
        name="beans"
        schema={mockSchema.beans}
      />,
    );
    const addBeanBtn = screen.getAllByTestId('metadata-add-beans-btn')[0];
    fireEvent.click(addBeanBtn);
    const beanNameInput = screen
      .getAllByLabelText('uniforms text field')
      .filter((input) => input.getAttribute('name') === 'name')[0];
    fireEvent.input(beanNameInput, { target: { value: 'bean1' } });
    const beanTypeInput = screen
      .getAllByLabelText('uniforms text field')
      .filter((input) => input.getAttribute('name') === 'type')[0];
    fireEvent.input(beanTypeInput, { target: { value: 'io.kaoto.MyBean' } });

    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].name).toBe('bean1');
    expect(beans[0].type).toBe('io.kaoto.MyBean');
  });

  test('Add a bean and cancel', async () => {
    useFlowsStore.getState().setMetadata('beans', []);
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={true}
        name="beans"
        schema={mockSchema.beans}
      />,
    );
    const addBeanBtn = screen.getAllByTestId('metadata-add-beans-btn')[0];
    fireEvent.click(addBeanBtn);
    const beanNameInput = screen
      .getAllByLabelText('uniforms text field')
      .filter((input) => input.getAttribute('name') === 'name')[0];
    fireEvent.input(beanNameInput, { target: { value: 'bean1' } });
    const beanTypeInput = screen
      .getAllByLabelText('uniforms text field')
      .filter((input) => input.getAttribute('name') === 'type')[0];
    fireEvent.input(beanTypeInput, { target: { value: 'io.kaoto.MyBean' } });

    const cancelBtn = screen.getByTestId('metadata-beans-cancel-btn');
    fireEvent.click(cancelBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans.length).toBe(0);
  });

  test('change bean name and save', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
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
    const nameInput = screen
      .getAllByLabelText('uniforms text field')
      .filter((input) => input.getAttribute('name') === 'name')[0];
    fireEvent.input(nameInput, { target: { value: 'beanNameModified' } });
    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].name).toBe('beanNameModified');
  });

  test('change bean name and cancel', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
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
    const nameInput = screen
      .getAllByLabelText('uniforms text field')
      .filter((input) => input.getAttribute('name') === 'name')[0];
    fireEvent.input(nameInput, { target: { value: 'beanNameModified' } });
    const cancelBtn = screen.getByTestId('metadata-beans-cancel-btn');
    fireEvent.click(cancelBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].name).toBe('bean1');
  });

  test('delete a bean and save', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={true}
        name="beans"
        schema={mockSchema.beans}
      />,
    );
    const deleteBtn = screen.getByTestId('metadata-delete-0-btn');
    fireEvent.click(deleteBtn);
    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans.length).toBe(1);
    expect(beans[0].name).toBe('bean2');
  });

  test('delete a bean and cancel', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
    render(
      <MetadataEditorModal
        handleCloseModal={jest.fn()}
        isModalOpen={true}
        name="beans"
        schema={mockSchema.beans}
      />,
    );
    const deleteBtn = screen.getByTestId('metadata-delete-0-btn');
    fireEvent.click(deleteBtn);
    const cancelBtn = screen.getByTestId('metadata-beans-cancel-btn');
    fireEvent.click(cancelBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans.length).toBe(2);
    expect(beans[0].name).toBe('bean1');
  });

  /*
   * Bean Properties
   */

  test('add string property and confirm', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beansNoProp));
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

    const addStringPropBtn = screen.getAllByTestId('properties-add-string-property--btn')[0];
    fireEvent.click(addStringPropBtn);
    const propNameInput = screen.getByTestId('properties--placeholder-name-input');
    fireEvent.input(propNameInput, { target: { value: 'propStr' } });
    const propValueInput = screen.getByTestId('properties--placeholder-value-input');
    fireEvent.input(propValueInput, { target: { value: 'propStrVal' } });
    const confirmBtn = screen.getByTestId('properties--placeholder-property-edit-confirm--btn');
    fireEvent.click(confirmBtn);

    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].properties.propStr).toBe('propStrVal');
  });

  test('add object property and confirm', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beansNoProp));
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

    const addObjectPropBtn = screen.getAllByTestId('properties-add-object-property--btn')[0];
    fireEvent.click(addObjectPropBtn);
    const nameInput = screen.getByTestId('properties--placeholder-name-input');
    fireEvent.input(nameInput, { target: { value: 'propObj' } });
    const confirmBtn = screen.getByTestId('properties--placeholder-property-edit-confirm--btn');
    fireEvent.click(confirmBtn);

    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].properties.propObj).toBeTruthy();
  });

  test('add string property and cancel', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beansNoProp));
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

    const addStringPropBtn = screen.getAllByTestId('properties-add-string-property--btn')[0];
    fireEvent.click(addStringPropBtn);
    const propNameInput = screen.getByTestId('properties--placeholder-name-input');
    fireEvent.input(propNameInput, { target: { value: 'propStr' } });
    const propValueInput = screen.getByTestId('properties--placeholder-value-input');
    fireEvent.input(propValueInput, { target: { value: 'propStrVal' } });
    const cancelBtn = screen.getByTestId('properties--placeholder-property-edit-cancel--btn');
    fireEvent.click(cancelBtn);

    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].properties.propStr).toBeFalsy();
  });

  test('add object property and cancel', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beansNoProp));
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

    const addObjectPropBtn = screen.getAllByTestId('properties-add-object-property--btn')[0];
    fireEvent.click(addObjectPropBtn);
    const nameInput = screen.getByTestId('properties--placeholder-name-input');
    fireEvent.input(nameInput, { target: { value: 'propObj' } });
    const objCancelBtn = screen.getByTestId('properties--placeholder-property-edit-cancel--btn');
    fireEvent.click(objCancelBtn);

    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].properties.propObj).toBeFalsy();
  });

  test('change string property and confirm', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
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

    const strEditBtn = screen.getByTestId('properties-prop1-property-edit-prop1-btn');
    fireEvent.click(strEditBtn);
    const propNameInput = screen.getByTestId('properties-prop1-name-input');
    fireEvent.input(propNameInput, { target: { value: 'prop1Modified' } });
    const propValueInput = screen.getByTestId('properties-prop1-value-input');
    fireEvent.input(propValueInput, { target: { value: 'prop1ValModified' } });
    const confirmBtn = screen.getByTestId('properties-prop1-property-edit-confirm-prop1-btn');
    fireEvent.click(confirmBtn);

    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].properties.prop1Modified).toBe('prop1ValModified');
  });

  test('change object property and confirm', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
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

    const objEditBtn = screen.getByTestId('properties-propObj1-property-edit-propObj1-btn');
    fireEvent.click(objEditBtn);
    const objPropNameInput = screen.getByTestId('properties-propObj1-name-input');
    fireEvent.input(objPropNameInput, { target: { value: 'propObj1Modified' } });
    const objConfirmBtn = screen.getByTestId(
      'properties-propObj1-property-edit-confirm-propObj1-btn',
    );
    fireEvent.click(objConfirmBtn);

    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].properties.propObj1Modified.propObj1Sub).toBe('valueObj1');
  });

  test('change string property and cancel', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
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

    const strEditBtn = screen.getByTestId('properties-prop1-property-edit-prop1-btn');
    fireEvent.click(strEditBtn);
    const propNameInput = screen.getByTestId('properties-prop1-name-input');
    fireEvent.input(propNameInput, { target: { value: 'prop1Modified' } });
    const propValueInput = screen.getByTestId('properties-prop1-value-input');
    fireEvent.input(propValueInput, { target: { value: 'prop1ValModified' } });
    const cancelBtn = screen.getByTestId('properties-prop1-property-edit-cancel-prop1-btn');
    fireEvent.click(cancelBtn);

    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].properties.prop1).toBe('value1');
    expect(beans[0].properties.prop1Modified).toBeFalsy();
  });

  test('change object property and cancel', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
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

    const objEditBtn = screen.getByTestId('properties-propObj1-property-edit-propObj1-btn');
    fireEvent.click(objEditBtn);
    const objPropNameInput = screen.getByTestId('properties-propObj1-name-input');
    fireEvent.input(objPropNameInput, { target: { value: 'propObj1Modified' } });
    const objCancelBtn = screen.getByTestId(
      'properties-propObj1-property-edit-cancel-propObj1-btn',
    );
    fireEvent.click(objCancelBtn);

    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].properties.propObj1.propObj1Sub).toBe('valueObj1');
    expect(beans[0].properties.propObj1Modified).toBeFalsy();
  });

  test('delete property and save', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
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
    const expandBtn = screen.getByLabelText('Expand row 1');
    fireEvent.click(expandBtn);
    const deleteBtn = screen.getByTestId('properties-propObj1-propObj1Sub-delete-propObj1Sub-btn');
    fireEvent.click(deleteBtn);
    const saveBtn = screen.getByTestId('metadata-beans-save-btn');
    fireEvent.click(saveBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].properties.propObj1.propObj1Sub).toBeFalsy();
  });

  test('delete property and cancel', async () => {
    useFlowsStore.getState().setMetadata('beans', cloneDeep(mockModel.beans));
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
    const expandBtn = screen.getByLabelText('Expand row 1');
    fireEvent.click(expandBtn);
    const deleteBtn = screen.getByTestId('properties-prop1-delete-prop1-btn');
    fireEvent.click(deleteBtn);
    const cancelBtn = screen.getByTestId('metadata-beans-cancel-btn');
    fireEvent.click(cancelBtn);
    const beans = useFlowsStore.getState().metadata.beans as any[];
    expect(beans[0].properties.prop1).toBeTruthy();
  });
});
