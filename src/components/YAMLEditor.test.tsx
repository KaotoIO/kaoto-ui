import { render } from '@testing-library/react';
import { YAMLEditor } from './YAMLEditor';

test('component renders correctly', () => {
  const { container } = render(<YAMLEditor handleChanges={jest.fn()} />);
  expect(container.getElementsByClassName('code-editor').length).toBe(1);
});
