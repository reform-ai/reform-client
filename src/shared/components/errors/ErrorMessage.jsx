import React from 'react';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles/constants';

/**
 * ErrorMessage - Displays inline error messages
 * 
 * Use this component for displaying smaller, inline error messages,
 * such as form validation errors or field-specific errors.
 * 
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {string} [props.size='small'] - Message size: 'small' | 'medium'
 * @param {Object} [props.style] - Optional inline styles
 * 
 * @returns {JSX.Element|null} Error message or null if message is empty
 * 
 * @example
 * // Basic usage
 * <ErrorMessage message="This field is required" />
 * 
 * @example
 * // Medium size
 * <ErrorMessage 
 *   message="Invalid email format"
 *   size="medium"
 * />
 */
const ErrorMessage = ({ message, size = 'small', style = {} }) => {
  if (!message) return null;

  const sizeStyles = {
    small: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      marginTop: SPACING.xs,
    },
    medium: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      marginTop: SPACING.sm,
    },
  };

  return (
    <div
      style={{
        color: COLORS.status.cancelled,
        ...sizeStyles[size],
        ...style,
      }}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;

