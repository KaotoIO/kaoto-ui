import { SourceCodeEditor } from './SourceCodeEditor';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Code Editor/SourceCodeEditor',
  component: SourceCodeEditor,
} as ComponentMeta<typeof SourceCodeEditor>;

const Template: ComponentStory<typeof SourceCodeEditor> = (args) => {
  return <SourceCodeEditor {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
