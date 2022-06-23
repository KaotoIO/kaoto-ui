import { IExpanded } from '../pages/Dashboard';
import { ISettings } from '../types';
import { KaotoToolbarOld } from './KaotoToolbarOld';
import { AlertProvider } from './MASAlerts';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

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
        <KaotoToolbarOld
          expanded={expandedTest}
          handleExpanded={jest.fn()}
          settings={settingsTest}
        />
      </AlertProvider>
    );

    const element = screen.getByTestId('kaotoToolbar');
    expect(element).toBeInTheDocument();
  });
});
