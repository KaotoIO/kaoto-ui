import { Catalog } from './Catalog';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Catalog/Catalog',
  component: Catalog,
  argTypes: { handleClose: { action: 'clicked' } },
} as ComponentMeta<typeof Catalog>;

const Template: ComponentStory<typeof Catalog> = (args) => {
  return <Catalog {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
