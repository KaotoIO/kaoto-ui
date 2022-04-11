import { KaotoToolbar } from './KaotoToolbar';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { IExpanded, ISettings } from '../pages/Dashboard';

describe('KaotoToolbar.tsx', () => {
  test('component renders correctly', () => {
    const expandedTest: IExpanded = {
      catalog: false,
      codeEditor: false,
      settingsModal: false,
    };

    const settingsTest: ISettings = {
      dsl: 'KameletBinding',
      name: 'A Test Integration',
    };

    render(
      <KaotoToolbar expanded={expandedTest} handleExpanded={jest.fn()} settings={settingsTest} />
    );

    const element = screen.getByTestId('kaotoToolbar');
    expect(element).toBeInTheDocument();
  });
});
