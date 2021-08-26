import { ComponentStory, ComponentMeta } from '@storybook/react';

import { VizReactFlow } from '../components/VizReactFlow';

export default {
  title: 'Visualization/React Flow',
  component: VizReactFlow,
} as ComponentMeta<typeof VizReactFlow>;

import steps from './data/steps';

const Template: ComponentStory<typeof VizReactFlow> = (args) => {
  // For now the only view data we care about are steps
  const viewData = {
    steps
  };

  return (
    <>
      <h1>React Flow</h1>
      <div style={{width: '50%', height: '500px'}}>
        <VizReactFlow steps={viewData.steps} />
      </div>
    </>
  )
};

export const Primary = Template.bind({});
//Primary.args = {};

