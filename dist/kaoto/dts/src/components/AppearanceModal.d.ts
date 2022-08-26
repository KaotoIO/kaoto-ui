/// <reference types="react" />
export interface IAppearanceModal {
    handleCloseModal: () => void;
    isModalOpen: boolean;
}
/**
 * Contains the contents for the Appearance modal.
 * @param handleCloseModal
 * @param isModalOpen
 * @constructor
 */
export declare const AppearanceModal: ({ handleCloseModal, isModalOpen }: IAppearanceModal) => JSX.Element;
