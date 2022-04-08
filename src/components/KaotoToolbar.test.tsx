import { KaotoToolbar } from './KaotoToolbar';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { IExpanded } from '../pages/Dashboard';

describe('KaotoToolbar.tsx', () => {
  test('component renders correctly', () => {
    const expandedTest: IExpanded = {
      catalog: false,
      codeEditor: false,
      settingsModal: false,
    };

    render(
      <KaotoToolbar expanded={expandedTest} handleDeploy={jest.fn()} handleExpanded={jest.fn()} />
    );

    const element = screen.getByTestId('kaotoToolbar');
    expect(element).toBeInTheDocument();
  });
});
