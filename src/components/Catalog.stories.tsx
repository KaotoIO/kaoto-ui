// For now the only view data we care about are steps
import { AlertProvider } from '../layout/MASAlerts';
import catalogData from '../store/data/catalog';
import { Catalog, ICatalog } from './Catalog';
import { Drawer, DrawerContent } from '@patternfly/react-core';
import { action } from '@storybook/addon-actions';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Components/Catalog',
  component: Catalog,
} as ComponentMeta<typeof Catalog>;

const Template: ComponentStory<typeof Catalog> = (props: ICatalog) => {
  return (
    <AlertProvider>
      <Drawer
        isExpanded={props.isCatalogExpanded}
        onExpand={() => {
          action('Catalog expanded');
        }}
        position={'left'}
      >
        <DrawerContent panelContent={<Catalog {...props} />} className={'panelCustom'} />
      </Drawer>
    </AlertProvider>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  isCatalogExpanded: true,
  onClosePanelClick: action('Catalog opened'),
  steps: catalogData,
};
