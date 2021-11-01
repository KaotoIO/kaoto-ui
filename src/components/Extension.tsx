import {
  Children,
  cloneElement,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  Suspense,
  useEffect,
} from 'react';
import root from 'react-shadow';

import ErrorBoundary from './ErrorBoundary';

type Props = PropsWithChildren<{
  name: string;
  loading?: ReactNode;
  failure?: ReactNode;
}>;

export function Extension(props: Props) {
  const { loading = 'Loading...', failure = 'Error!' } = props;

  const children = Children.map(props.children, (child) => {
    if (['string', 'number', 'boolean'].includes(typeof child)) return child;

    if ((child as any).type.$$typeof === Symbol.for('react.lazy')) {
      return cloneElement(child as ReactElement, {
        name: props.name,
      });
    }

    return child;
  });

  useEffect(() => {
    return () => {
      localStorage.removeItem(`location_${props.name}`);
    };
  }, [props.name]);

  return (
    <ErrorBoundary fallback={failure}>
      <Suspense fallback={loading}>
        <root.div>{children}</root.div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default Extension;
