import React from 'react';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../styles/constants';

/**
 * ErrorBanner - Displays error messages in a prominent banner format
 * 
 * Use this component for displaying important errors that need user attention,
 * such as API errors, validation errors, or critical operation failures.
 * 
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {string} [props.type='error'] - Error type: 'error' | 'warning' | 'info'
 * @param {Function} [props.onDismiss] - Optional callback when user dismisses the error
 * @param {Object} [props.style] - Optional inline styles to override default container styles
 * 
 * @returns {JSX.Element|null} Error banner or null if message is empty
 * 
 * @example
 * // Basic usage
 * <ErrorBanner message="Failed to load data" />
 * 
 * @example
 * // With dismiss button
 * <ErrorBanner 
 *   message="Operation failed"
 *   onDismiss={() => setError(null)}
 * />
 * 
 * @example
 * // Warning type
 * <ErrorBanner 
 *   message="This action cannot be undone"
 *   type="warning"
 * />
 */
const ErrorBanner = ({ message, type = 'error', onDismiss, style = {} }) => {
  if (!message) return null;

  const typeStyles = {
    error: {
      backgroundColor: `${COLORS.status.cancelled}15`,
      borderColor: COLORS.status.cancelled,
      color: COLORS.status.cancelled,
    },
    warning: {
      backgroundColor: `${COLORS.status.pending}15`,
      borderColor: COLORS.status.pending,
      color: COLORS.status.pending,
    },
    info: {
      backgroundColor: `${COLORS.accent.blue}15`,
      borderColor: COLORS.accent.blue,
      color: COLORS.accent.blue,
    },
  };

  const currentStyle = typeStyles[type] || typeStyles.error;

  return (
    <div
      style={{
        padding: SPACING.md,
        backgroundColor: currentStyle.backgroundColor,
        border: `1px solid ${currentStyle.borderColor}`,
        borderRadius: BORDER_RADIUS.md,
        color: currentStyle.color,
        fontSize: TYPOGRAPHY.fontSize.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
        ...style,
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: currentStyle.color,
            cursor: 'pointer',
            padding: SPACING.xs,
            fontSize: TYPOGRAPHY.fontSize.lg,
            lineHeight: 1,
            opacity: 0.7,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = 1;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = 0.7;
          }}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;

