import { Visualization } from './Visualization';
import { ComponentStory, ComponentMeta } from '@storybook/react';
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
} as ComponentMeta<typeof Visualization>;

const Template: ComponentStory<typeof Visualization> = (args) => {
  return <Visualization {...args} />;
};

export const EmptyState = Template.bind({});
EmptyState.args = {};
