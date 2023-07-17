import { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export interface IErrorFallback {
  error: Error;
}

export interface IStepErrorBoundary {
  children: ReactNode;
}

const ErrorFallback = ({ error }: IErrorFallback) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
};

export const StepErrorBoundary = ({ children }: IStepErrorBoundary) => (
  <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[Date.now()]}>
    {children}
  </ErrorBoundary>
);
