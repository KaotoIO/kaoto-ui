import { OrangeExclamationTriangleIcon } from './Icons';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { FunctionComponent, PropsWithChildren } from 'react';

export interface IConfirmationModal extends PropsWithChildren {
  handleCancel: () => void;
  handleConfirm: () => void;
  isModalOpen: boolean;
  modalTitle?: string;
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
export const ConfirmationModal: FunctionComponent<IConfirmationModal> = ({
  children,
  handleCancel,
  handleConfirm,
  isModalOpen,
  modalTitle,
}) => {
  const onCancel = () => {
    handleCancel();
  };

  const onConfirm = () => {
    handleConfirm();
  };

  return (
    <div className="confirmation-modal" data-testid="confirmation-modal">
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
        className="customClass"
        titleIconVariant={OrangeExclamationTriangleIcon}
        title={modalTitle ?? 'Confirmation'}
        variant={ModalVariant.small}
      >
        {children}
      </Modal>
    </div>
  );
};
