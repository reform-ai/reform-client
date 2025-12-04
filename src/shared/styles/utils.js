/**
 * Style Utility Functions
 * 
 * Helper functions for creating consistent styles.
 * These utilities help reduce duplication and ensure consistency.
 * 
 * Usage:
 *   import { createCardStyle, createButtonStyle } from '../shared/styles/utils';
 *   <div style={createCardStyle({ padding: '20px' })}>
 */

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, COMMON_STYLES } from './constants';

/**
 * Create a card style with optional overrides
 * 
 * @param {Object} overrides - Style properties to override
 * @returns {Object} Style object
 */
export const createCardStyle = (overrides = {}) => {
  return {
    ...COMMON_STYLES.card,
    ...overrides,
  };
};

/**
 * Create a button style with variant and optional overrides
 * 
 * @param {string} variant - Button variant: 'primary' | 'secondary' | 'danger' | 'success'
 * @param {Object} overrides - Style properties to override
 * @returns {Object} Style object
 */
export const createButtonStyle = (variant = 'primary', overrides = {}) => {
  const baseStyle = { ...COMMON_STYLES.button };
  
  const variants = {
    primary: {
      backgroundColor: COLORS.accent.blue,
      color: 'white',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: COLORS.text.primary,
      border: `1px solid ${COLORS.border.default}`,
    },
    danger: {
      backgroundColor: COLORS.status.cancelled,
      color: 'white',
    },
    success: {
      backgroundColor: COLORS.status.scheduled,
      color: 'white',
    },
    warning: {
      backgroundColor: COLORS.status.pending,
      color: 'white',
    },
  };
  
  return {
    ...baseStyle,
    ...(variants[variant] || variants.primary),
    ...overrides,
  };
};

/**
 * Create a status badge style
 * 
 * @param {string} status - Status value
 * @param {string} size - Size: 'small' | 'medium' | 'large'
 * @returns {Object} Style object
 */
export const createStatusBadgeStyle = (status, size = 'medium') => {
  const statusColors = {
    pending: COLORS.status.pending,
    pending_booking: COLORS.status.pendingBooking,
    scheduled: COLORS.status.scheduled,
    active: COLORS.status.active,
    completed: COLORS.status.completed,
    cancelled: COLORS.status.cancelled,
  };
  
  const sizes = {
    small: {
      padding: `${SPACING.xs} ${SPACING.md}`,
      fontSize: TYPOGRAPHY.fontSize.xs,
    },
    medium: {
      padding: `${SPACING.sm} ${SPACING.lg}`,
      fontSize: TYPOGRAPHY.fontSize.sm,
    },
    large: {
      padding: `${SPACING.md} ${SPACING.xl}`,
      fontSize: TYPOGRAPHY.fontSize.base,
    },
  };
  
  const color = statusColors[status] || COLORS.status.completed;
  
  return {
    ...sizes[size],
    borderRadius: BORDER_RADIUS.full,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
    backgroundColor: `${color}20`,
    color: color,
  };
};

/**
 * Create a container style with max-width and centering
 * 
 * @param {string} maxWidth - Max width (default: '800px')
 * @param {Object} overrides - Style properties to override
 * @returns {Object} Style object
 */
export const createContainerStyle = (maxWidth = '800px', overrides = {}) => {
  return {
    maxWidth,
    margin: '0 auto',
    padding: SPACING.xl,
    ...overrides,
  };
};

/**
 * Create a section heading style
 * 
 * @param {Object} overrides - Style properties to override
 * @returns {Object} Style object
 */
export const createHeadingStyle = (overrides = {}) => {
  return {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
    ...overrides,
  };
};

/**
 * Create expert-coaching booking info style based on status
 * 
 * @param {boolean} isPending - Whether booking is pending
 * @returns {Object} Style object with colors for pending/confirmed states
 */
export const createBookingInfoStyle = (isPending) => {
  return {
    backgroundColor: isPending ? COLORS.expertCoaching.pendingBg : COLORS.expertCoaching.confirmedBg,
    border: `2px solid ${isPending ? COLORS.expertCoaching.pendingBorder : COLORS.expertCoaching.confirmedBorder}`,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
  };
};

/**
 * Create expert-coaching booking text colors based on status
 * 
 * @param {boolean} isPending - Whether booking is pending
 * @returns {Object} Object with textColor and textColorLight
 */
export const createBookingTextColors = (isPending) => {
  return {
    textColor: isPending ? COLORS.expertCoaching.pendingText : COLORS.expertCoaching.confirmedText,
    textColorLight: isPending ? COLORS.expertCoaching.pendingTextLight : COLORS.expertCoaching.confirmedTextLight,
  };
};

