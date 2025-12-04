/**
 * Date formatting utilities specifically for Expert Coaching feature.
 * 
 * These utilities handle the special requirements for expert coaching:
 * - Scheduled times (scheduled_start_time, scheduled_end_time) should always display in Eastern timezone
 * - Regular timestamps (created_at, etc.) use user's local timezone
 * 
 * This module extends the base dateFormat utilities without modifying them.
 */

import { parseUTCDate, formatDateTime, formatTimeOnly } from '../../../shared/utils/dateFormat';

/**
 * Format scheduled consultation time in Eastern timezone.
 * Used for scheduled_start_time and scheduled_end_time to ensure consistency
 * across all users (PT and clients see the same time).
 * 
 * @param {string|Date} dateValue - UTC date to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeDate - Whether to include date (default: true)
 * @param {boolean} options.includeTime - Whether to include time (default: true)
 * @param {boolean} options.includeWeekday - Whether to include weekday (default: false)
 * @returns {string} Formatted date string in Eastern timezone ("N/A" if invalid)
 */
export const formatScheduledTime = (dateValue, options = {}) => {
  const { includeDate = true, includeTime = true, includeWeekday = false } = options;
  
  const date = parseUTCDate(dateValue);
  if (!date) {
    if (dateValue) console.warn('Invalid scheduled time:', dateValue);
    return 'N/A';
  }
  
  const formatOptions = {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  };
  
  if (includeWeekday) {
    formatOptions.weekday = 'long';
  }
  
  if (includeDate) {
    formatOptions.year = 'numeric';
    formatOptions.month = 'long';
    formatOptions.day = 'numeric';
  }
  
  if (!includeTime) {
    delete formatOptions.hour;
    delete formatOptions.minute;
    delete formatOptions.timeZoneName;
  }
  
  return date.toLocaleString('en-US', formatOptions);
};

/**
 * Format scheduled consultation start time (full format with weekday).
 * Used for displaying the main scheduled time in booking confirmations.
 * 
 * @param {string|Date} dateValue - UTC date to format
 * @returns {string} Formatted date string in Eastern timezone
 */
export const formatScheduledStartTime = (dateValue) => {
  return formatScheduledTime(dateValue, {
    includeDate: true,
    includeTime: true,
    includeWeekday: true
  });
};

/**
 * Format scheduled consultation end time (time only).
 * Used for displaying the end time after the start time.
 * 
 * @param {string|Date} dateValue - UTC date to format
 * @returns {string} Formatted time string in Eastern timezone
 */
export const formatScheduledEndTime = (dateValue) => {
  return formatScheduledTime(dateValue, {
    includeDate: false,
    includeTime: true,
    includeWeekday: false
  });
};

/**
 * Format regular consultation timestamps (created_at, started_at, etc.).
 * These use the user's local timezone via the base formatDateTime function.
 * 
 * @param {string|Date} dateValue - UTC date to format
 * @returns {string} Formatted date string in user's local timezone
 */
export const formatConsultationTimestamp = (dateValue) => {
  return formatDateTime(dateValue);
};

