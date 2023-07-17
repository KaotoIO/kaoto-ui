import { useDocumentTitle } from './document-title.hook';
import { renderHook } from '@testing-library/react';

describe('useDocumentTitle', () => {
  it('should set the document title', () => {
    const { rerender } = renderHook((props) => useDocumentTitle(props), {
      initialProps: 'Hello World',
    });

    expect(document.title).toEqual('Hello World');

    rerender('Hello World 2');

    expect(document.title).toEqual('Hello World 2');
  });
});
