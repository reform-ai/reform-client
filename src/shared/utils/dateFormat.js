/**
 * Format date for display in posts and comments
 * Shows "just now" for < 1 min, "x min ago" for 1-30 min, or full date/time for > 30 min
 * @param {string|Date} dateValue - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return '';
  
  let date;
  
  if (typeof dateValue === 'string') {
    let dateString = dateValue;
    // API returns UTC times without timezone indicator
    // If no 'Z' or timezone offset, treat as UTC by appending 'Z'
    if (!dateString.includes('Z') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
      dateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    }
    // Parse as UTC and convert to local timezone
    date = new Date(dateString);
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    date = new Date(dateValue);
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', dateValue);
    return '';
  }
  
  // Get current time in user's local timezone
  const now = new Date();
  
  // Calculate difference in milliseconds (both dates are in local timezone after parsing)
  const diffMs = now.getTime() - date.getTime();
  
  // If date is in the future, show the date
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
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  
  // Less than 1 minute: "just now"
  if (diffMinutes < 1) {
    return 'just now';
  }
  
  // 1-30 minutes: "x min ago" or "xm ago" (matching existing format)
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

