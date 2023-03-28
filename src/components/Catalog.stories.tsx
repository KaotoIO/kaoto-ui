import { Catalog } from './Catalog';
import KaotoDrawer from './KaotoDrawer';
import { DrawerContentBody } from '@patternfly/react-core';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Catalog/Catalog',
  component: Catalog,
  argTypes: { handleClose: { action: 'clicked' } },
  decorators: [
    (Story) => (
      <div style={{ height: 'calc(100vh - 29px)' }}>
        <KaotoDrawer
          isExpanded={true}
          panelContent={
            <DrawerContentBody style={{ padding: '10px' }}>
              <Story />
            </DrawerContentBody>
          }
          children={<></>}
          position={'left'}
        />
      </div>
    ),
  ],
} as ComponentMeta<typeof Catalog>;

const Template: ComponentStory<typeof Catalog> = (args) => {
  return <Catalog {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
