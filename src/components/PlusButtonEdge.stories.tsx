import { PlusButtonEdge } from './PlusButtonEdge';
import { IVizStepNode } from '@kaoto/types';
import { Meta, StoryFn } from '@storybook/react';
import { ReactFlowProvider } from 'reactflow';

export default {
  title: 'Visualization/PlusButtonEdge',
  component: PlusButtonEdge,
  args: {
    id: 'e-node-id-1>node-id-2',
    data: {
      showBranchesTab: true,
      showStepsTab: true,
      sourceStepNode: {
        data: { step: {} },
      } as IVizStepNode,
      targetStepNode: {
        data: { step: {} },
      } as IVizStepNode,
    },
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
} as Meta<typeof PlusButtonEdge>;

const Template: StoryFn<typeof PlusButtonEdge> = (args) => {
  return <PlusButtonEdge {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
