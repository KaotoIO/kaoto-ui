import { StepsAndViewsProvider, YAMLProvider } from '../api';
import { AlertProvider, Visualization } from '../components';
import { Page } from '@patternfly/react-core';
// For now the only view data we care about are steps
// import steps from './data/steps';
// import views from './data/views';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Visualization',
  component: Visualization,
  // decorators: [(story) => <Provider store={store}>{story()}</Provider>],
  decorators: [
    (Story) => {
      return (
        <AlertProvider>
          <Page>
            <StepsAndViewsProvider>
              <YAMLProvider>
                <Story />
              </YAMLProvider>
            </StepsAndViewsProvider>
          </Page>
        </AlertProvider>
      );
    },
  ],
} as ComponentMeta<typeof Visualization>;

const Template: ComponentStory<typeof Visualization> = () => {
  return (
    <>
      <h1>Visualization</h1>
      <br />
      {<Visualization />}
    </>
  );
};

export const Kamelet = Template.bind({});
Kamelet.args = {};

export const Integration = Template.bind({});
Integration.args = {};
