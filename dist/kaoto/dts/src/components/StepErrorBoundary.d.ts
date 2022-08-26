import { ReactNode } from 'react';
export interface IErrorFallback {
    error: Error;
}
export interface IStepErrorBoundary {
    children: ReactNode;
}
export declare const StepErrorBoundary: ({ children }: IStepErrorBoundary) => JSX.Element;
