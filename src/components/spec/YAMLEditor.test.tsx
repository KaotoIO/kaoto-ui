import { render, screen } from '@testing-library/react';
import { YAMLEditor } from '../YAMLEditor';

describe('something', () => {
  it('something else', () => {
    //
  });
});

test('Renders correctly', () => {
  render(<YAMLEditor handleChanges={jest.fn()} />);
  const editor = screen.getByAltText('Editor');
  expect(editor).toBeInTheDocument();
});
