import { FieldLabelIcon } from './FieldLabelIcon';
import { ComponentStory, ComponentMeta } from '@storybook/react';

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
} as ComponentMeta<typeof FieldLabelIcon>;

const Template: ComponentStory<typeof FieldLabelIcon> = (args) => {
  return <FieldLabelIcon {...args} disabled={false} />;
};

export const Default = Template.bind({});
Default.args = {};
