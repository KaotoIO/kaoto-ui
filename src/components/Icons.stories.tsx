import { CustomExclamationTriangleIcon } from './Icons';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Layout/Icons',
  component: CustomExclamationTriangleIcon,
  argTypes: { props: { color: 'orange' } },
} as ComponentMeta<typeof CustomExclamationTriangleIcon>;

const Template: ComponentStory<typeof CustomExclamationTriangleIcon> = (args) => {
  return <CustomExclamationTriangleIcon {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
