import { ThemeSwitcher } from './ThemeSwitcher';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Settings/ThemeSwitcher',
  component: ThemeSwitcher,
} as Meta<typeof ThemeSwitcher>;

const Template: StoryFn<typeof ThemeSwitcher> = () => {
  return <ThemeSwitcher />;
};

export const Default = Template.bind({});
