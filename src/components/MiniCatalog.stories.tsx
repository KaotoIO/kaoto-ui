import catalog from '../data/catalog';
import { MiniCatalog, IMiniCatalog } from './MiniCatalog';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Components/MiniCatalog',
  component: MiniCatalog,
} as ComponentMeta<typeof MiniCatalog>;

const Template: ComponentStory<typeof MiniCatalog> = (props: IMiniCatalog) => {
  return <MiniCatalog {...props} />;
};

export const Primary = Template.bind({});
Primary.args = {
  steps: catalog,
};
