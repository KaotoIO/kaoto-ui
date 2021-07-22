import { ComponentStory, ComponentMeta } from '@storybook/react';

import { YAMLEditor } from '../components/YAMLEditor';
//import response from './twitter-search-source-binding-res.json';
import data from './twitter-search-source-binding.yaml';

export default {
  title: 'YAMLEditor',
  component: YAMLEditor,
  argTypes: {
    //backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof YAMLEditor>;

const Template: ComponentStory<typeof YAMLEditor> = (args) => <YAMLEditor {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  //primary: true,
  data,
  //label: 'YAMLEditor',
  //response
};

