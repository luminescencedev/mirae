import { Component, type ErrorInfo, type ReactNode } from "react";

type FallbackProps = { error: Error; reset: () => void };

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: (props: FallbackProps) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = { error: Error | null };

// Generic React error boundary. Catches render/lifecycle errors in its
// subtree and hands them to `fallback`; `reset` clears the caught error so
// the subtree can attempt to re-render.
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) return this.props.fallback({ error, reset: this.reset });
    return this.props.children;
  }
}
