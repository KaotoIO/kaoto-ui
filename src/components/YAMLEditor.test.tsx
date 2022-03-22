import { YAMLEditor } from './YAMLEditor';
import { render } from '@testing-library/react';
import { Language } from '@patternfly/react-code-editor';
import { screen } from '@testing-library/dom';

describe('YAMLEditor.tsx', () => {
  test('component renders correctly', () => {
    render(<YAMLEditor language={Language.yaml} />);
    const emptyStateBrowseBtn = screen.getByRole('textbox');
    expect(emptyStateBrowseBtn).toBeInTheDocument();
  });
});
