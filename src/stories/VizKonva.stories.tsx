import { ComponentStory, ComponentMeta } from '@storybook/react';

import { VizKonva } from '../components/VizKonva';

// For now the only view data we care about are steps
import steps from './steps';

export default {
  title: 'Visualization/Konva',
  component: VizKonva,
} as ComponentMeta<typeof VizKonva>;

const Template: ComponentStory<typeof VizKonva> = (args) => {
  return (
    <>
      <h1>Konva</h1>
      <VizKonva steps={args.steps} />
    </>
  );
};

export const Kamelet = Template.bind({});
Kamelet.args = { steps };

export const Integration = Template.bind({});
Integration.args = { steps: [...steps, steps[1]] };
