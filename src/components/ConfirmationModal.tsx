import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { OrangeExclamationTriangleIcon } from "./Icons";


export interface IConfirmationModal {
  handleCancel: () => void;
  handleConfirm: () => void;
  isModalOpen: boolean;
  modalTitle?: string;
  modalBody?: string;
}

/**
 * Contains the contents for the Confirmation modal.
 * @param handleCancel
 * @param handleConfirm
 * @param isModalOpen
 * @param modalBody
 * @param modalTitle
 * @constructor
 */
export const ConfirmationModal = ({
  handleCancel,
  handleConfirm,
  isModalOpen,
  modalBody,
  modalTitle,
}: IConfirmationModal) => {
  const onCancel = () => {
    handleCancel();
  };

  const onConfirm = () => {
    handleConfirm();
  };

  return (
    <div className={'confirmation-modal'} data-testid={'confirmation-modal'}>
      <Modal
        actions={[
          <Button key="confirm" variant="primary" onClick={onConfirm}>
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={onCancel}>
            Cancel
          </Button>,
        ]}
        aria-describedby="modal-description"
        isOpen={isModalOpen}
        onClose={handleCancel}
        className={'customClass'}
        titleIconVariant={OrangeExclamationTriangleIcon}
        title={modalTitle ?? 'Confirmation'}
        variant={ModalVariant.small}
      >
        <span id="modal-description">
          {modalBody ??
            'WARNING! This action is not reversible. Are you sure you would like to proceed?'}
        </span>
      </Modal>
    </div>
  );
};
