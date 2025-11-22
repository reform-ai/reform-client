/**
 * Date formatting utilities for displaying UTC dates in user's local timezone.
 * 
 * All dates from the API are stored in UTC. These functions:
 * 1. Parse UTC timestamps (with or without timezone indicators)
 * 2. Convert to user's local timezone for display
 * 3. Format according to the function's purpose
 * 
 * This ensures consistent display regardless of user's timezone settings,
 * while keeping all backend calculations timezone-independent (UTC-based).
 */

/**
 * Parses a date value and converts UTC strings to proper Date objects.
 * Handles API responses that may or may not include timezone indicators.
 * 
 * @param {string|Date} dateValue - Date to parse
 * @returns {Date|null} Parsed Date object, or null if invalid
 * @private
 */
const parseUTCDate = (dateValue) => {
  if (!dateValue) return null;
  
  // If already a Date object, return as-is
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // Handle string dates
  if (typeof dateValue === 'string') {
    let dateString = dateValue;
    
    // API returns UTC times without timezone indicator
    // If no 'Z' or timezone offset, treat as UTC by appending 'Z'
    if (!dateString.includes('Z') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
      dateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    }
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Fallback: try to parse as Date
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Format date for display in posts and comments (relative format).
 * Shows "just now" for < 1 min, "x min ago" for 1-30 min, or full date/time for > 30 min.
 * 
 * @param {string|Date} dateValue - Date to format
 * @returns {string} Formatted date string (empty string if invalid)
 */
export const formatDate = (dateValue) => {
  const date = parseUTCDate(dateValue);
  if (!date) {
    if (dateValue) console.warn('Invalid date:', dateValue);
    return '';
  }
  
  // Get current time in user's local timezone
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // If date is in the future, show full date/time
  if (diffMs < 0) {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // Less than 1 minute: "just now"
  if (diffMinutes < 1) {
    return 'just now';
  }
  
  // 1-30 minutes: "x min ago"
  if (diffMinutes <= 30) {
    return `${diffMinutes}m ago`;
  }
  
  // More than 30 minutes: full date/time with timezone
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

/**
 * Format date and time for display (full format, not relative).
 * Properly handles UTC dates from the API and converts to user's local timezone.
 * 
 * @param {string|Date} dateValue - Date to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeTime - Whether to include time (default: true)
 * @param {boolean} options.includeTimezone - Whether to include timezone (default: true)
 * @returns {string} Formatted date string ("N/A" if invalid)
 */
export const formatDateTime = (dateValue, options = {}) => {
  const { includeTime = true, includeTimezone = true } = options;
  
  const date = parseUTCDate(dateValue);
  if (!date) {
    if (dateValue) console.warn('Invalid date:', dateValue);
    return 'N/A';
  }
  
  const formatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }
  
  if (includeTimezone) {
    formatOptions.timeZoneName = 'short';
  }
  
  return date.toLocaleString(undefined, formatOptions);
};

/**
 * Format date only (no time) for display.
 * Properly handles UTC dates from the API and converts to user's local timezone.
 * 
 * @param {string|Date} dateValue - Date to format
 * @returns {string} Formatted date string ("Never" if invalid or null)
 */
export const formatDateOnly = (dateValue) => {
  const date = parseUTCDate(dateValue);
  if (!date) {
    if (dateValue) console.warn('Invalid date:', dateValue);
    return 'Never';
  }
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

