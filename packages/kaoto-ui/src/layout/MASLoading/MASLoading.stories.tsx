import { MASLoading } from './MASLoading';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Layout/MASLoading',
  component: MASLoading,
} as Meta<typeof MASLoading>;

const Template: StoryFn<typeof MASLoading> = (args) => {
  return <MASLoading {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
