import { YAMLEditor } from './YAMLEditor';
import { render } from '@testing-library/react';
import { Language } from '@patternfly/react-code-editor';

describe('YAMLEditor.tsx', () => {
  test('component renders correctly', () => {
    const { container } = render(<YAMLEditor language={Language.yaml} />);
    expect(container.getElementsByClassName('code-editor').length).toBe(1);
  });
});
