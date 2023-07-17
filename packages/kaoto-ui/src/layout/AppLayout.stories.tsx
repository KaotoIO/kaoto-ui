import { AppLayout } from './AppLayout';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Layout/AppLayout',
  component: AppLayout,
} as Meta<typeof AppLayout>;

const Template: StoryFn<typeof AppLayout> = (args) => {
  return <AppLayout children={args.children} />;
};

export const Default = Template.bind({});
Default.args = {
  children: <div>Some child component</div>,
};
