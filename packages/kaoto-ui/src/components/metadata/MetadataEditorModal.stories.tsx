import { MetadataEditorModal } from './MetadataEditorModal';
import { mockSchema } from './TestUtil';
import { useArgs } from '@storybook/client-api';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Metadata/MetadataEditorModal',
  component: MetadataEditorModal,
  excludeStories: ['schemaMock'],
  decorators: [
    (Story) => (
      <div style={{ margin: '3em' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: { handleCloseModal: { action: 'clicked' } },
} as Meta<typeof MetadataEditorModal>;

const Template: StoryFn<typeof MetadataEditorModal> = (args) => {
  const [{ isModalOpen }, updateArgs] = useArgs();
  const handleClose = () => updateArgs({ isModalOpen: !isModalOpen });
  return (
    <>
      <button onClick={() => updateArgs({ isModalOpen: !isModalOpen })}>
        Open Metadata Editor Modal
      </button>
      <MetadataEditorModal {...args} handleCloseModal={handleClose} />
    </>
  );
};

export const BeansArray = Template.bind({});
BeansArray.args = {
  name: 'beans',
  schema: mockSchema.beans,
};

export const SingleObject = Template.bind({});
SingleObject.args = {
  name: 'singleObject',
  schema: mockSchema.single,
};
