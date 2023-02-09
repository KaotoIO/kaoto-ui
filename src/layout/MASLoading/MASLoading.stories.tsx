import { MASLoading } from './MASLoading';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Layout/MASLoading',
  component: MASLoading,
} as ComponentMeta<typeof MASLoading>;

const Template: ComponentStory<typeof MASLoading> = (args) => {
  return <MASLoading {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
