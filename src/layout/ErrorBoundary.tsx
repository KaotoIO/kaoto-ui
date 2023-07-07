import { Component, PropsWithChildren, ReactNode } from 'react';

type Props = PropsWithChildren<{
  fallback: ReactNode;
}>;

type State = {
  error: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { error: false };
  }

  static getDerivedStateFromError() {
    return { error: true };
  }

  render() {
    if (this.state.error) return this.props.fallback;

    return this.props.children;
  }
}
