import { KaotoToolbar } from './KaotoToolbar';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { IExpanded } from '../pages/Dashboard';
import { ISettings } from '../types';
import { AlertProvider } from './MASAlerts';

describe('KaotoToolbar.tsx', () => {
  test('component renders correctly', () => {
    const expandedTest: IExpanded = {
      catalog: false,
      codeEditor: false,
      settingsModal: false,
    };

    const settingsTest: ISettings = {
      dsl: 'KameletBinding',
      integrationName: 'A Test Integration',
      namespace: 'default',
    };

    render(
      <AlertProvider>
        <KaotoToolbar expanded={expandedTest} handleExpanded={jest.fn()} settings={settingsTest} />
      </AlertProvider>
    );

    const element = screen.getByTestId('kaotoToolbar');
    expect(element).toBeInTheDocument();
  });
});
