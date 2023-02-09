import { KaotoToolbar } from './KaotoToolbar';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Layout/KaotoToolbar',
  component: KaotoToolbar,
  argTypes: {
    hideLeftPanel: { action: 'clicked' },
    toggleCatalog: { action: 'toggled' },
    toggleCodeEditor: { action: 'toggled' },
  },
} as ComponentMeta<typeof KaotoToolbar>;

const Template: ComponentStory<typeof KaotoToolbar> = (args) => {
  return <KaotoToolbar {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
