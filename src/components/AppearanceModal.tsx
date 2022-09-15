import { HeaderTools } from '@kaoto/layout';
import { Form, FormSection, Modal, ModalVariant } from '@patternfly/react-core';

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
export const AppearanceModal = ({ handleCloseModal, isModalOpen }: IAppearanceModal) => {
  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      title="Appearance Settings"
      data-testid={'appearance-modal'}
      variant={ModalVariant.small}
    >
      <br />
      <Form>
        <FormSection title="Light/Dark Mode" titleElement="h2">
          <HeaderTools />
        </FormSection>
      </Form>
    </Modal>
  );
};
