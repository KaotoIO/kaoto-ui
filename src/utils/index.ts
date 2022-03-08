import { IStepProps } from '../types';
import { useEffect, useRef } from 'react';

export function accessibleRouteChangeHandler() {
  return window.setTimeout(() => {
    const mainContainer = document.getElementById('primary-app-container');
    if (mainContainer) {
      mainContainer.focus();
    }
  }, 50);
}

/**
 * Returns a Step index when provided with the `UUID`.
 * `UUID` is originally set using the Step UUID.
 * @param UUID
 * @param steps
 */
export function findStepIdxWithUUID(UUID: string, steps: IStepProps[]) {
  return steps.map((s) => s.UUID).indexOf(UUID);
}

export function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + '..';
  } else {
    return str;
  }
}

/**
 * A custom hook for setting the page title.
 * @param title
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}

/**
 * A custom hook for setting mutable refs.
 * @param value
 */
export function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
