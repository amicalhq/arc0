/**
 * Error boundary component for capturing React rendering errors.
 * Sends errors to PostHog and displays a fallback UI.
 */

import { usePostHog } from 'posthog-react-native';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, View } from 'react-native';

interface InnerErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI to show when an error occurs */
  fallback?: ReactNode;
  /** Callback to capture exception */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Inner class component that handles the error boundary logic.
 */
class InnerErrorBoundary extends Component<InnerErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: InnerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI if provided, otherwise show default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            The app encountered an unexpected error. Please restart the app.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

interface PostHogErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI to show when an error occurs */
  fallback?: ReactNode;
}

/**
 * Error boundary that captures React rendering errors and reports them to PostHog.
 * Must be used inside PostHogProvider to have access to the client.
 */
export function PostHogErrorBoundary({ children, fallback }: PostHogErrorBoundaryProps) {
  const posthog = usePostHog();

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    if (posthog) {
      // Capture the error with component stack trace
      posthog.captureException(error, {
        react_component_stack: errorInfo.componentStack ?? null,
        error_boundary: true,
      });
    }
  };

  return (
    <InnerErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </InnerErrorBoundary>
  );
}
