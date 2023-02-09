import { ThemeSwitcher } from './ThemeSwitcher';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Settings/ThemeSwitcher',
  component: ThemeSwitcher,
} as ComponentMeta<typeof ThemeSwitcher>;

const Template: ComponentStory<typeof ThemeSwitcher> = () => {
  return <ThemeSwitcher />;
};

export const Default = Template.bind({});
