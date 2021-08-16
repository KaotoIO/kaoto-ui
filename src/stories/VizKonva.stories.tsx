//import { action } from '@storybook/addon-actions';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { VizKonva } from '../components/VizKonva';

import steps from './steps';

export default {
  title: 'Visualization/Konva',
  component: VizKonva,
} as ComponentMeta<typeof VizKonva>;

//const Template: ComponentStory<typeof VizKonva> = (args) => <VizKonva {...args} />;
const Template: ComponentStory<typeof VizKonva> = (args) => {
  // For now the only view data we care about are steps
  const viewData = {
    steps
  };

  return (
    <VizKonva steps={viewData.steps} />
  );
};

export const Primary = Template.bind({});
//Primary.args = {};

