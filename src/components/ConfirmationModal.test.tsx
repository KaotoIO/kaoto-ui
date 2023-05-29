import { ConfirmationModal } from './ConfirmationModal';
import { fireEvent, render } from '@testing-library/react';

describe('ConfirmationModal.tsx', () => {
  let onConfirm: jest.Mock;
  let onCancel: jest.Mock;

  beforeEach(() => {
    onConfirm = jest.fn();
    onCancel = jest.fn();
  });

  test('component renders', () => {
    const wrapper = render(
      <ConfirmationModal handleConfirm={onConfirm} handleCancel={onCancel} isModalOpen={true} />,
    );

    const element = wrapper.queryByTestId('confirmation-modal');
    expect(element).toBeInTheDocument();
  });

  test('click on confirm', async () => {
    const wrapper = render(
      <ConfirmationModal handleConfirm={onConfirm} handleCancel={onCancel} isModalOpen={true} />,
    );

    const confirmButton = await wrapper.findByText('Confirm');
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalled();
  });

  test('click on cancel', async () => {
    const wrapper = render(
      <ConfirmationModal handleConfirm={onConfirm} handleCancel={onCancel} isModalOpen={true} />,
    );

    const cancelButton = await wrapper.findByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  test('should have "Confirmation" as title if not specified', async () => {
    const wrapper = render(
      <ConfirmationModal handleConfirm={onConfirm} handleCancel={onCancel} isModalOpen={true} />,
    );

    const title = await wrapper.findByRole('heading');

    expect(title).toHaveTextContent('Confirmation');
  });

  test('should have a title if specified', async () => {
    const wrapper = render(
      <ConfirmationModal
        handleConfirm={onConfirm}
        handleCancel={onCancel}
        isModalOpen={true}
        modalTitle="This is a different title"
      />,
    );

    const title = await wrapper.findByRole('heading');

    expect(title).toHaveTextContent('This is a different title');
  });
});
