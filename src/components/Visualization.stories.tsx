import { StepsAndViewsProvider } from '../api';
import steps from '../data/steps';
import views from '../data/views';
import { AlertProvider, Visualization } from './index';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Visualization',
  component: Visualization,
  decorators: [
    (Story, context) => {
      return (
        <AlertProvider>
          <StepsAndViewsProvider initialState={context.args.initialState}>
            <Story />
          </StepsAndViewsProvider>
        </AlertProvider>
      );
    },
  ],
} as ComponentMeta<typeof Visualization>;

const Template: ComponentStory<typeof Visualization> = (args) => {
  return (
    <>
      <h1>Visualization</h1>
      <br />
      {<Visualization {...args} />}
    </>
  );
};

export const Kamelet = Template.bind({});
Kamelet.args = {
  initialState: {
    steps: steps,
    views: views,
  },
  toggleCatalog: () => {},
};

export const Integration = Template.bind({});
Integration.args = {
  initialState: {
    steps: steps,
    views: views,
  },
  toggleCatalog: () => {},
};
