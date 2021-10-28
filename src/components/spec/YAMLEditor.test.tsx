import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { YAMLEditor } from '../YAMLEditor';

describe('something', () => {
  it('something else', () => {
    //
  });
});

test('Renders correctly', () => {
  render(
    <YAMLEditor
      handleChanges={() => {
        console.log('blah');
      }}
    />
  );
  const editor = screen.getByAltText('Editor');
  expect(editor).toBeInTheDocument();
});
