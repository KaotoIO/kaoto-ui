import { action } from '@storybook/addon-actions';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Catalog } from '../components/Catalog';

// For now the only view data we care about are steps
import catalog from './data/catalog';

const handleChanges = action('Catalog opened');

export default {
  title: 'Catalog',
  component: Catalog,
} as ComponentMeta<typeof Catalog>;

const Template: ComponentStory<typeof Catalog> = (args) => {
  const steps = catalog;

  return (
    <>
      <h1>Kamelet Catalog</h1>
      <Catalog isCatalogExpanded={true} onClosePanelClick={handleChanges} steps={steps} />
    </>
  );
};

export const Kamelet = Template.bind({});
Kamelet.args = {};
