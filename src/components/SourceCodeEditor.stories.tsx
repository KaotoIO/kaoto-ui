import { SourceCodeEditor } from './SourceCodeEditor';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Code Editor/SourceCodeEditor',
  component: SourceCodeEditor,
} as Meta<typeof SourceCodeEditor>;

const Template: StoryFn<typeof SourceCodeEditor> = (args) => {
  return <SourceCodeEditor {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
