import { AppearanceModal } from './AppearanceModal';
import { useArgs } from '@storybook/client-api';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Settings/AppearanceModal',
  component: AppearanceModal,
  decorators: [
    (Story) => (
      <div style={{ margin: '3em' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: { handleCloseModal: { action: 'clicked' } },
} as Meta<typeof AppearanceModal>;

const Template: StoryFn<typeof AppearanceModal> = (args) => {
  const [{ isModalOpen }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ isModalOpen: !isModalOpen });
  return (
    <>
      <button onClick={() => updateArgs({ isModalOpen: !isModalOpen })}>
        Open Appearance Modal
      </button>
      <AppearanceModal {...args} handleCloseModal={handleClose} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};
