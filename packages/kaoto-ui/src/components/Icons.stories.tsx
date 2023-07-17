import { CustomExclamationTriangleIcon } from './Icons';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Layout/Icons',
  component: CustomExclamationTriangleIcon,
  argTypes: { props: { color: 'orange' } },
} as Meta<typeof CustomExclamationTriangleIcon>;

const Template: StoryFn<typeof CustomExclamationTriangleIcon> = (args) => {
  return <CustomExclamationTriangleIcon {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
