import { MiniCatalog } from './MiniCatalog';
import { IStepQueryParams } from '@kaoto/types';
import { StoryFn, Meta } from '@storybook/react';

export default {
  title: 'Catalog/MiniCatalog',
  component: MiniCatalog,
  argTypes: {
    handleSelectStep: { action: 'clicked' },
    queryParams: {
      dsl: 'KameletBinding',
      kind: 'Kamelet',
      namespace: 'default',
      type: 'START',
    } as IStepQueryParams,
  },
} as Meta<typeof MiniCatalog>;

const Template: StoryFn<typeof MiniCatalog> = (args) => {
  return <MiniCatalog {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  disableBranchesTab: false,
  disableStepsTab: false,
};

export const DisableStepsTab = Template.bind({});
DisableStepsTab.args = {
  disableBranchesTab: false,
  disableStepsTab: true,
};

export const DisableBranchesTab = Template.bind({});
DisableBranchesTab.args = {
  disableBranchesTab: true,
  disableStepsTab: false,
};

export const DisableBranchesTabTooltip = Template.bind({});
DisableBranchesTabTooltip.args = {
  disableBranchesTab: true,
  disableBranchesTabMsg: "This step doesn't support branching.",
  disableStepsTab: false,
};

export const DisableStepsTabTooltip = Template.bind({});
DisableStepsTabTooltip.args = {
  disableBranchesTab: false,
  disableStepsTab: true,
  disableStepsTabMsg: "You can't add a step between a step and a branch.",
};
