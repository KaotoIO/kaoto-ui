import { FieldLabelIcon } from './FieldLabelIcon';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Step Views/FieldLabelIcon',
  component: FieldLabelIcon,
  decorators: [
    (Story) => (
      <div style={{ margin: '3em' }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof FieldLabelIcon>;

const Template: StoryFn<typeof FieldLabelIcon> = (args) => {
  return <FieldLabelIcon {...args} disabled={false} />;
};

export const Default = Template.bind({});
Default.args = {};
