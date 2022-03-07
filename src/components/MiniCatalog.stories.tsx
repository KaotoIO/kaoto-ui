import catalog from '../data/catalog';
import { AlertProvider } from './MASAlerts';
import { MiniCatalog, IMiniCatalog } from './MiniCatalog';
import { action } from '@storybook/addon-actions';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Components/MiniCatalog',
  component: MiniCatalog,
} as ComponentMeta<typeof MiniCatalog>;

const Template: ComponentStory<typeof MiniCatalog> = (props: IMiniCatalog) => {
  return (
    <AlertProvider>
      <div style={{ maxWidth: '20%' }}>
        <MiniCatalog {...props} />
      </div>
    </AlertProvider>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  handleSelectStep: action('Step selected'),
  steps: catalog,
};
