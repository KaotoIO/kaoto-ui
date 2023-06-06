import { usePrevious } from './previous.hook';
import { renderHook } from '@testing-library/react';

describe('usePrevious', () => {
  it('should return the previous value', () => {
    const { result, rerender } = renderHook((props) => usePrevious(props), {
      initialProps: 1,
    });

    /** undefined at the first render */
    expect(result.current).toBeUndefined();

    /** Update the property */
    rerender(2);

    /** Should stay one step back */
    expect(result.current).toEqual(1);
  });
});
