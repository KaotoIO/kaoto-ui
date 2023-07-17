import { useRef, useEffect } from 'react';

/**
 * A custom hook for setting mutable refs.
 * @param value
 * TODO: This hook is leveraging a React behavior that might change in the future.
 */
export const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
