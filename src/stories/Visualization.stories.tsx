import { StepsAndViewsProvider, YAMLProvider } from '../api';
import { AlertProvider, Visualization } from '../components';
import steps from './data/steps';
import views from './data/views';
import initialYAML from './data/yaml';
import { Page } from '@patternfly/react-core';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Visualization',
  component: Visualization,
  decorators: [
    (Story, context) => {
      return (
        <AlertProvider>
          <Page>
            <StepsAndViewsProvider initialState={context.args.initialState}>
              <YAMLProvider initialState={initialYAML}>
                <Story />
              </YAMLProvider>
            </StepsAndViewsProvider>
          </Page>
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
