import { PlusButtonEdge } from './PlusButtonEdge';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ReactFlowProvider } from 'reactflow';

export default {
  title: 'Visualization/PlusButtonEdge',
  component: PlusButtonEdge,
  args: {
    id: 'e-node-id-1>node-id-2',
    sourceX: 132,
    sourceY: 122,
    targetX: 200,
    targetY: 122,
    sourcePosition: 'right',
    targetPosition: 'left',
    markerEnd: '',
    style: {},
  },
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    ),
  ],
} as ComponentMeta<typeof PlusButtonEdge>;

const Template: ComponentStory<typeof PlusButtonEdge> = (args) => {
  return <PlusButtonEdge {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
