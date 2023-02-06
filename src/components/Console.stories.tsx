import { Console } from './Console';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Layout/Console',
  component: Console,
  argTypes: { handleCloseConsole: { action: 'closed' } },
} as ComponentMeta<typeof Console>;

const Template: ComponentStory<typeof Console> = (args) => {
  return <Console {...args} />;
};

export const NoCluster = Template.bind({});
NoCluster.args = {};
