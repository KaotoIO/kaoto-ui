import { capabilitiesStub } from '../stubs';
import { SettingsModal } from './SettingsModal';
import { AlertProvider } from '@kaoto/layout';
import { useSettingsStore } from '@kaoto/store';
import { useArgs } from '@storybook/preview-api';
import { StoryFn, Meta } from '@storybook/react';
import { useState } from 'react';

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

const NameDesc: StoryFn<typeof SettingsModal> = (args) => {
  const [isModalOpen, setModalOpen] = useState(args.isModalOpen);
  useSettingsStore().settings.dsl = capabilitiesStub[0];
  return (
    <>
      <button onClick={() => setModalOpen(!isModalOpen)}>
        Open Settings Modal with Name and Description
      </button>
      <AlertProvider>
        <SettingsModal
          {...args}
          isModalOpen={isModalOpen}
          handleCloseModal={() => setModalOpen(!isModalOpen)}
        />
      </AlertProvider>
    </>
  );
};
export const WithNameDesc = NameDesc.bind({});
WithNameDesc.args = {};
