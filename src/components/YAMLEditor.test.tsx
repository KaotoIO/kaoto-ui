import { YAMLEditor } from './YAMLEditor';
import { render } from '@testing-library/react';

describe('YAMLEditor.tsx', () => {
  test('component renders correctly', () => {
    const { container } = render(<YAMLEditor />);
    expect(container.getElementsByClassName('code-editor').length).toBe(1);
  });
});
