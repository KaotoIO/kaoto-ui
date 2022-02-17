import { YAMLEditor } from '../components';
import initialYAML from './data/yaml';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'YAMLEditor',
  component: YAMLEditor,
} as ComponentMeta<typeof YAMLEditor>;

const Template: ComponentStory<typeof YAMLEditor> = (props) => <YAMLEditor {...props} />;

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
