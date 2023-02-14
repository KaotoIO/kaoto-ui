import { Extension } from './Extension';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Step Views/Extension',
  component: Extension,
} as ComponentMeta<typeof Extension>;

const Template: ComponentStory<typeof Extension> = (args) => {
  return <Extension {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
