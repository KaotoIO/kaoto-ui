import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Catalog } from '../components/Catalog';

// For now the only view data we care about are steps
import catalog from './data/catalog';
import sortSteps from '../utils/sortSteps';

export default {
  title: 'Catalog',
  component: Catalog,
} as ComponentMeta<typeof Catalog>;

const Template: ComponentStory<typeof Catalog> = (args) => {
  const steps = sortSteps(catalog);
  const start = steps.start;
  const middle = steps.middle;
  const end = steps.end;

  return (
    <>
      <h1>Kamelet Catalog</h1>
      <Catalog start={start} middle={middle} end={end} />
    </>
  );
};

export const Kamelet = Template.bind({});
Kamelet.args = {};
