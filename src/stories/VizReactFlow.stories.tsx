import { ComponentStory, ComponentMeta } from '@storybook/react';

import { VizReactFlow } from '../components/VizReactFlow';

export default {
  title: 'Visualization/React Flow',
  component: VizReactFlow,
} as ComponentMeta<typeof VizReactFlow>;

const Template: ComponentStory<typeof VizReactFlow> = (args) => {
  return (
    <>
      <h1>React Flow</h1>
      <div style={{width: '50%', height: '500px'}}>
        <VizReactFlow />
      </div>
    </>
  )
};

export const Primary = Template.bind({});
//Primary.args = {};

