import { Console } from './Console';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Layout/Console',
  component: Console,
  argTypes: { handleCloseConsole: { action: 'closed' } },
} as Meta<typeof Console>;

const Template: StoryFn<typeof Console> = (args) => {
  return <Console {...args} />;
};

export const NoCluster = Template.bind({});
NoCluster.args = {};
