import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Visualization } from '../components/Visualization';

// For now the only view data we care about are steps
import steps from './data/steps';

export default {
  title: 'Visualization',
  component: Visualization,
} as ComponentMeta<typeof Visualization>;

const Template: ComponentStory<typeof Visualization> = (args) => {
  return (
    <>
      <h1>Konva</h1>
      <Visualization steps={args.steps} />
    </>
  );
};

export const Kamelet = Template.bind({});
Kamelet.args = { steps };

export const Integration = Template.bind({});
Integration.args = { steps: [...steps, steps[1]] };
