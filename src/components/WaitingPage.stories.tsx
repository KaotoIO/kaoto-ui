import { WaitingPage } from './WaitingPage';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Layout/WaitingPage',
  component: WaitingPage,
} as ComponentMeta<typeof WaitingPage>;

const Template: ComponentStory<typeof WaitingPage> = (args) => {
  return <WaitingPage {...args} message={'Trying to reach the Kaoto API'} />;
};

export const BackendFetching = Template.bind({});
BackendFetching.args = {
  fetching: true,
  message: 'Trying to reach the Kaoto API',
};

export const BackendUnavailable = Template.bind({});
BackendUnavailable.args = {
  fetching: false,
  message: 'Kaoto API is unreachable',
};
