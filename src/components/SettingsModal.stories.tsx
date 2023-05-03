import { SettingsModal } from './SettingsModal';
import { useArgs } from '@storybook/client-api';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Settings/SettingsModal',
  component: SettingsModal,
  decorators: [
    (Story) => (
      <div style={{ margin: '3em' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: { handleCloseModal: { action: 'clicked' } },
} as Meta<typeof SettingsModal>;

const Template: StoryFn<typeof SettingsModal> = (args) => {
  const [{ isModalOpen }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ isModalOpen: !isModalOpen });
  return (
    <>
      <button onClick={() => updateArgs({ isModalOpen: !isModalOpen })}>Open Settings Modal</button>
      <SettingsModal {...args} handleCloseModal={handleClose} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};
