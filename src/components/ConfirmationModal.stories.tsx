import { ConfirmationModal } from './ConfirmationModal';
import { useArgs } from '@storybook/client-api';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Layout/ConfirmationModal',
  component: ConfirmationModal,
  decorators: [
    (Story) => (
      <div style={{ margin: '3em' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: { handleCloseModal: { action: 'clicked' } },
} as ComponentMeta<typeof ConfirmationModal>;

const Template: ComponentStory<typeof ConfirmationModal> = (args) => {
  const [{ isModalOpen }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ isModalOpen: !isModalOpen });
  return (
    <>
      <button onClick={() => updateArgs({ isModalOpen: !isModalOpen })}>
        Open Confirmation Modal
      </button>
      <ConfirmationModal {...args} handleCancel={handleClose} handleConfirm={handleClose} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};
