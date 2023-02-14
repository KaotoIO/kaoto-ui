import { AppLayout } from './AppLayout';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Layout/AppLayout',
  component: AppLayout,
} as ComponentMeta<typeof AppLayout>;

const Template: ComponentStory<typeof AppLayout> = (args) => {
  return <AppLayout children={args.children} />;
};

export const Default = Template.bind({});
Default.args = {
  children: <div>Some child component</div>,
};
