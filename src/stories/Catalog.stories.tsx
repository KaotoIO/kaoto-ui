import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Catalog } from '../components/Catalog';

// For now the only view data we care about are steps
// import kamelets from './data/kamelets';

export default {
  title: 'Catalog',
  component: Catalog,
} as ComponentMeta<typeof Catalog>;

const Template: ComponentStory<typeof Catalog> = (args) => {
  return (
    <>
      <h1>Kamelet Catalog</h1>
      <Catalog />
    </>
  );
};

export const Kamelet = Template.bind({});
Kamelet.args = {};
