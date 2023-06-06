import { useEffect } from 'react';

/**
 * A custom hook for setting the page title.
 * @param title
 */
export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};
