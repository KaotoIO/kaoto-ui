import { Component, PropsWithChildren, ReactNode } from 'react';
declare type Props = PropsWithChildren<{
    fallback: ReactNode;
}>;
declare type State = {
    error: boolean;
};
export declare class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(): {
        error: boolean;
    };
    render(): ReactNode;
}
export default ErrorBoundary;
