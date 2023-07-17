import { Visualization } from './Visualization';
import { StoryFn, Meta } from '@storybook/react';
import { ReactFlowProvider } from 'reactflow';

export default {
  title: 'Visualization/Visualization',
  component: Visualization,
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    ),
  ],
  argTypes: { toggleCatalog: { action: 'toggled' } },
} as Meta<typeof Visualization>;

const Template: StoryFn<typeof Visualization> = () => {
  return <Visualization />;
};

export const EmptyState = Template.bind({});
EmptyState.args = {};
