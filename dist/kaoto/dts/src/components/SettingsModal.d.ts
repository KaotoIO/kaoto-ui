/// <reference types="react" />
export interface ISettingsModal {
    handleCloseModal: () => void;
    isModalOpen: boolean;
}
/**
 * Contains the contents for the Settings modal.
 * @param handleCloseModal
 * @param handleUpdateViews
 * @param isModalOpen
 * @constructor
 */
export declare const SettingsModal: ({ handleCloseModal, isModalOpen }: ISettingsModal) => JSX.Element;
