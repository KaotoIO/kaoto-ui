import { DeploymentsModal } from './DeploymentsModal';
import { useArgs } from '@storybook/client-api';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Deployment/DeploymentsModal',
  component: DeploymentsModal,
  decorators: [
    (Story) => (
      <div style={{ margin: '3em' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: { handleCloseModal: { action: 'clicked' } },
} as Meta<typeof DeploymentsModal>;

const Template: StoryFn<typeof DeploymentsModal> = (args) => {
  const [{ isModalOpen }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ isModalOpen: !isModalOpen });
  return (
    <>
      <button onClick={() => updateArgs({ isModalOpen: !isModalOpen })}>
        Open Deployments Modal
      </button>
      <DeploymentsModal {...args} handleCloseModal={handleClose} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};
