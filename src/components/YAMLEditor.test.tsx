import { YAMLEditor } from './YAMLEditor';
import { Language } from '@patternfly/react-code-editor';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('YAMLEditor.tsx', () => {
  test('component renders correctly', () => {
    render(<YAMLEditor language={Language.yaml} dsl={'KameletBinding'} />);
    const emptyStateBrowseBtn = screen.getByRole('textbox');
    expect(emptyStateBrowseBtn).toBeInTheDocument();
  });
});
