import { StepsAndViewsProvider } from '../api';
import { AlertProvider, Visualization } from '../components';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Dashboard/Visualization',
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
