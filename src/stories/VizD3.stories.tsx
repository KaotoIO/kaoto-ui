//import { action } from '@storybook/addon-actions';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { VizD3 } from '../components/VizD3';

export default {
  title: 'Visualization/D3',
  component: VizD3,
} as ComponentMeta<typeof VizD3>;

const Template: ComponentStory<typeof VizD3> = (args) => <VizD3 />;

export const Primary = Template.bind({});
//Primary.args = {};
