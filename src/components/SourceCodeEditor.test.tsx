import { SourceCodeEditor } from './SourceCodeEditor';
import { Language } from '@patternfly/react-code-editor';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('SourceCodeEditor.tsx', () => {
  test('component renders correctly', () => {
    render(
      <SourceCodeEditor
        language={Language.yaml}
        dsl={'KameletBinding'}
        handleUpdateViews={jest.fn()}
      />
    );
    const emptyStateBrowseBtn = screen.getByRole('textbox');
    expect(emptyStateBrowseBtn).toBeInTheDocument();
  });
});
