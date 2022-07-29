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
export declare const ConfirmationModal: ({ handleCancel, handleConfirm, isModalOpen, modalBody, modalTitle, }: IConfirmationModal) => JSX.Element;
