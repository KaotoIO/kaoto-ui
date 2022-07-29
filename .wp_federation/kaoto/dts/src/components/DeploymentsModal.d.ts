export interface IDeploymentsModal {
    handleCloseModal: () => void;
    isModalOpen: boolean;
}
/**
 * Contains the contents for the Deployments modal.
 * @param currentDeployment
 * @param handleCloseModal
 * @param isModalOpen
 * @constructor
 */
export declare const DeploymentsModal: ({ handleCloseModal, isModalOpen }: IDeploymentsModal) => JSX.Element;
