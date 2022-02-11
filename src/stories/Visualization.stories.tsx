import { AlertProvider, Visualization } from '../components';
// For now the only view data we care about are steps
import steps from './data/steps';
import views from './data/views';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Visualization',
  component: Visualization,
} as ComponentMeta<typeof Visualization>;

const Template: ComponentStory<typeof Visualization> = () => {
  return (
    <AlertProvider>
      <h1>Visualization</h1>
      <br />
      {/*<Visualization />*/}
    </AlertProvider>
  );
};

export const Kamelet = Template.bind({});
Kamelet.args = { steps, views };

export const Integration = Template.bind({});
Integration.args = { steps: [...steps, steps[1]] };
