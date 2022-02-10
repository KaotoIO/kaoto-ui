import { YAMLEditor } from '../components';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'YAMLEditor',
  component: YAMLEditor,
} as ComponentMeta<typeof YAMLEditor>;

const Template: ComponentStory<typeof YAMLEditor> = () => <YAMLEditor />;

export const Primary = Template.bind({});
Primary.args = {};
