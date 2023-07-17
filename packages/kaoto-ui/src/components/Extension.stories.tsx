import { Extension } from './Extension';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Step Views/Extension',
  component: Extension,
} as Meta<typeof Extension>;

const Template: StoryFn<typeof Extension> = (args) => {
  return <Extension {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
