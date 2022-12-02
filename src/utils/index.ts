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
 * Finds the path to a given target within a deeply nested object
 * @param o
 * @param target
 * @param key
 */
export function findPath(o: any, target: string, key: string): string[] | undefined {
  if (o === target) return [];

  // if it's an array just return the index
  if (!o || typeof o !== 'object') return;

  // iterate over each object keys
  for (const k in o) {
    // get the path for each object key's
    const temp: any | undefined[] = findPath(o[k], target, key);
    // if path exists, return the key and path,
    // unless it's for the key specified
    if (temp && k === key) return [...temp];
    if (temp) return [k, ...temp];
  }
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'long' }).format(
    Date.parse(date)
  );
}

export function pathToString(path: any, ...prefixes: any[]) {
  const rxArrIndex = /\D/;
  const rxVarName = /^[a-zA-Z_$]+([\w_$]*)$/;
  const rxQuot = /"/g;

  prefixes = prefixes.filter((p) => p !== undefined);
  if (typeof path === 'string') return joinPaths(...prefixes, path);
  if (!Array.isArray(path)) return undefined;
  prefixes = joinPaths(...prefixes);
  return path.reduce((acc, value) => {
    const type = typeof value;
    if (type === 'number') {
      if (value < 0 || value % 1 !== 0) {
        return `${acc}["${value}"]`;
      } else {
        return `${acc}[${value}]`;
      }
    } else if (type !== 'string') {
      return `${acc}["${value}"]`;
    } else if (!value) {
      return `${acc}[""]`;
    }
    if (!rxArrIndex.test(value)) {
      return `${acc}[${value}]`;
    }
    if (rxVarName.test(value)) {
      if (acc) {
        return `${acc}.${value}`;
      } else {
        return `${acc}${value}`;
      }
    }
    return `${acc}["${value.replace(rxQuot, '\\"')}"]`;
  }, prefixes);
}

export function joinPaths(...paths: any) {
  return paths.reduce(
    (acc: any, p: string) => (acc ? (!p || p.startsWith('[') ? `${acc}${p}` : `${acc}.${p}`) : p),
    ''
  );
}

export function setDeepValue(obj: any, path: any, value: any) {
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

  return pathArray.reduce((acc: { [x: string]: any }, key: string | number, i: number) => {
    if (acc[key] === undefined) acc[key] = {};
    if (i === pathArray.length - 1) acc[key] = value;
    return acc[key];
  }, obj);
}

// Shorten a string to less than maxLen characters without truncating words.
export function shorten(str: string, maxLen: number, separator = ' ') {
  if (!str) return;
  if (str.length <= maxLen) return str;
  return str.substr(0, str.lastIndexOf(separator, maxLen)) + '..';
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

/**
 * A binding for undo/redo commands
 */
export function bindUndoRedo(undoCallback: () => void, redoCallback: () => void) {
  const callback = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
      redoCallback();
    } else if (event.ctrlKey && event.key === 'z') {
      undoCallback();
    } else if (event.ctrlKey && event.key === 'y') {
      redoCallback();
    }
  };
  document.addEventListener('keydown', callback);
  return callback;
}

export function unbindUndoRedo(callback: (event: KeyboardEvent) => void) {
  document.removeEventListener('keydown', callback);
}
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
