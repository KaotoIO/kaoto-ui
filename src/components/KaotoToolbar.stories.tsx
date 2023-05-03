import { KaotoToolbar } from './KaotoToolbar';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Layout/KaotoToolbar',
  component: KaotoToolbar,
  argTypes: {
    hideLeftPanel: { action: 'clicked' },
    toggleCatalog: { action: 'toggled' },
    toggleCodeEditor: { action: 'toggled' },
  },
} as Meta<typeof KaotoToolbar>;

const Template: StoryFn<typeof KaotoToolbar> = (args) => {
  return <KaotoToolbar {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
