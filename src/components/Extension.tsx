import { StepErrorBoundary } from './StepErrorBoundary';
import {
  Children,
  cloneElement,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  Suspense,
  useEffect,
} from 'react';

type Props = PropsWithChildren<{
  name: string;
  loading?: ReactNode;
  failure?: ReactNode;
}>;

export function Extension(props: Props) {
  const { loading = 'Loading...' } = props;

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
    <StepErrorBoundary>
      <Suspense fallback={loading}>{children}</Suspense>
    </StepErrorBoundary>
  );
}

export default Extension;
