import { VisualizationControls } from './VisualizationControls';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ReactFlowProvider } from 'reactflow';

export default {
  title: 'Visualization/VisualizationControls',
  component: VisualizationControls,
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    ),
  ],
} as ComponentMeta<typeof VisualizationControls>;

const Template: ComponentStory<typeof VisualizationControls> = () => {
  return <VisualizationControls />;
};

export const Default = Template.bind({});
