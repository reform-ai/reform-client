import React from 'react';
import ErrorBanner from './ErrorBanner';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../styles/constants';

/**
 * ErrorBoundary - React error boundary component for catching and displaying errors
 * 
 * Catches JavaScript errors anywhere in the child component tree, logs them,
 * and displays a fallback UI instead of crashing the entire app.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {Function} [props.onError] - Optional callback when error occurs: (error, errorInfo) => void
 * @param {React.Component} [props.fallback] - Optional custom fallback component
 * 
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * @example
 * // With error callback
 * <ErrorBoundary onError={(error, info) => logErrorToService(error, info)}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleReset);
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: SPACING['2xl'],
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              padding: SPACING['2xl'],
              backgroundColor: COLORS.bg.secondary,
              border: `2px solid ${COLORS.status.cancelled}`,
              borderRadius: BORDER_RADIUS.lg,
            }}
          >
            <h2
              style={{
                fontSize: TYPOGRAPHY.fontSize.xl,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                color: COLORS.status.cancelled,
                marginBottom: SPACING.md,
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: COLORS.text.secondary,
                marginBottom: SPACING.lg,
                fontSize: TYPOGRAPHY.fontSize.base,
              }}
            >
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  marginTop: SPACING.lg,
                  padding: SPACING.md,
                  backgroundColor: COLORS.bg.tertiary,
                  borderRadius: BORDER_RADIUS.md,
                  fontSize: TYPOGRAPHY.fontSize.xs,
                  color: COLORS.text.muted,
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: SPACING.sm }}>
                  Error Details (Development Only)
                </summary>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    marginTop: SPACING.sm,
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              style={{
                marginTop: SPACING.lg,
                padding: `${SPACING.sm} ${SPACING.lg}`,
                backgroundColor: COLORS.accent.blue,
                color: 'white',
                border: 'none',
                borderRadius: BORDER_RADIUS.md,
                fontSize: TYPOGRAPHY.fontSize.sm,
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

