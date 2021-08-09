//import { action } from '@storybook/addon-actions';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { VizKonva } from '../components/VizKonva';

export default {
  title: 'Visualization/Konva',
  component: VizKonva,
} as ComponentMeta<typeof VizKonva>;

//const Template: ComponentStory<typeof VizKonva> = (args) => <VizKonva {...args} />;
const Template: ComponentStory<typeof VizKonva> = (args) => <VizKonva />;

export const Primary = Template.bind({});
//Primary.args = {};

