import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Visualization } from '../components/Visualization';

// For now the only view data we care about are steps
import steps from './data/steps';
import views from './data/views';

export default {
  title: 'Visualization',
  component: Visualization,
} as ComponentMeta<typeof Visualization>;

const Template: ComponentStory<typeof Visualization> = (args) => {
  return (
    <>
      <h1>Konva</h1>
      <Visualization steps={args.steps} views={args.views} />
    </>
  );
};

export const Kamelet = Template.bind({});
Kamelet.args = { steps, views };

export const Integration = Template.bind({});
Integration.args = { steps: [...steps, steps[1]] };
