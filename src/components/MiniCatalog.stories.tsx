import { MiniCatalog } from './MiniCatalog';
import { IStepQueryParams } from '@kaoto/types';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Catalog/MiniCatalog',
  component: MiniCatalog,
  argTypes: {
    handleSelectStep: { action: 'clicked' },
    queryParams: {
      dsl: 'KameletBinding',
      kind: 'Kamelet',
      namespace: 'default',
      type: 'START',
    } as IStepQueryParams,
  },
} as ComponentMeta<typeof MiniCatalog>;

const Template: ComponentStory<typeof MiniCatalog> = (args) => {
  return <MiniCatalog {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
