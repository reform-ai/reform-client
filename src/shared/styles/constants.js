/**
 * Style Constants for Reform Client
 * 
 * Centralized styling constants to ensure consistency across the application.
 * Use these constants instead of hardcoding values in inline styles.
 * 
 * Usage:
 *   import { COLORS, SPACING, TYPOGRAPHY } from '../shared/styles/constants';
 *   <div style={{ padding: SPACING.md, color: COLORS.text.primary }}>
 */

/**
 * Color constants matching CSS variables
 * Use these for inline styles to maintain consistency with CSS variables
 */
export const COLORS = {
  // Background colors
  bg: {
    primary: 'var(--bg-primary)',
    secondary: 'var(--bg-secondary)',
    tertiary: 'var(--bg-tertiary)',
    card: 'var(--card-bg)',
    cardHover: 'var(--card-hover)',
  },
  
  // Text colors
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    muted: 'var(--text-muted)',
  },
  
  // Border colors
  border: {
    default: 'var(--border-color)',
    hover: 'var(--border-color-hover)',
    card: 'var(--card-border)',
  },
  
  // Status colors (matching expert-coaching constants)
  status: {
    pending: '#f59e0b',
    pendingBooking: '#3b82f6',
    scheduled: '#10b981',
    active: '#10b981',
    completed: '#6b7280',
    cancelled: '#ef4444',
  },
  
  // Score colors
  score: {
    excellent: 'var(--score-excellent)',
    good: 'var(--score-good)',
    warning: 'var(--score-warning)',
    poor: 'var(--score-poor)',
  },
  
  // Accent colors
  accent: {
    green: 'var(--accent-green)',
    blue: 'var(--accent-blue)',
    amber: 'var(--accent-amber)',
    orange: 'var(--accent-orange)',
  },
  
  // Button colors
  button: {
    bg: 'var(--button-bg)',
    text: 'var(--button-text)',
    border: 'var(--button-border)',
    hover: 'var(--button-hover)',
  },
  
  // Semantic colors for expert-coaching
  expertCoaching: {
    pendingBg: '#fef3c7',
    pendingBorder: '#f59e0b',
    pendingText: '#92400e',
    pendingTextLight: '#78350f',
    confirmedBg: '#d1fae5',
    confirmedBorder: '#10b981',
    confirmedText: '#065f46',
    confirmedTextLight: '#047857',
  },
};

/**
 * Spacing constants
 * Use these for consistent spacing throughout the app
 */
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
};

/**
 * Typography constants
 */
export const TYPOGRAPHY = {
  fontFamily: "'Inter', -apple-system, 'system-ui', sans-serif",
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
};

/**
 * Border radius constants
 */
export const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

/**
 * Common style objects for frequently used patterns
 */
export const COMMON_STYLES = {
  // Card styles
  card: {
    padding: SPACING['2xl'],
    border: `1px solid ${COLORS.border.card}`,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.bg.card,
  },
  
  // Button base styles
  button: {
    padding: `${SPACING.sm} ${SPACING.lg}`,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    borderRadius: BORDER_RADIUS.md,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  
  // Input styles
  input: {
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    backgroundColor: COLORS.bg.secondary,
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: BORDER_RADIUS.md,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  
  // Section container
  section: {
    marginBottom: SPACING['2xl'],
  },
  
  // Page container
  pageContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: SPACING.xl,
  },
};

