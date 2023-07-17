import { WaitingPage } from './WaitingPage';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Layout/WaitingPage',
  component: WaitingPage,
} as Meta<typeof WaitingPage>;

const Template: StoryFn<typeof WaitingPage> = (args) => {
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
