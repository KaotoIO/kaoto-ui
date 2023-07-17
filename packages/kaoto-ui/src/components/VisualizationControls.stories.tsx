import { VisualizationControls } from './VisualizationControls';
import { StoryFn, Meta } from '@storybook/react';
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
} as Meta<typeof VisualizationControls>;

const Template: StoryFn<typeof VisualizationControls> = () => {
  return <VisualizationControls />;
};

export const Default = Template.bind({});
