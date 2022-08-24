import initialYAML from '../store/data/yaml';
import { SourceCodeEditor } from './index';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Components/SourceCodeEditor',
  component: SourceCodeEditor,
} as ComponentMeta<typeof SourceCodeEditor>;

const Template: ComponentStory<typeof SourceCodeEditor> = (props) => (
  <SourceCodeEditor {...props} />
);

export const Primary = Template.bind({});
Primary.args = {
  initialData: initialYAML,
  language: 'yaml',
  theme: 'vs-dark',
};

export const Light = Template.bind({});
Light.args = {
  initialData: initialYAML,
  language: 'yaml',
  theme: 'vs-light',
};
