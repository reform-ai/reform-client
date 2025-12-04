/**
 * Constants and utilities for Expert Coaching feature.
 * Centralized location for shared values and helper functions.
 */

/**
 * Get color for consultation status badge.
 * 
 * @param {string} status - Consultation status
 * @returns {string} Hex color code
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    pending_booking: '#3b82f6',
    scheduled: '#10b981',
    active: '#10b981',
    completed: '#6b7280',
    cancelled: '#ef4444'
  };
  return colors[status] || '#6b7280';
};

/**
 * Get human-readable status label.
 * 
 * @param {string} status - Consultation status
 * @returns {string} Human-readable label
 */
export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    pending_booking: 'Pending Booking',
    scheduled: 'Scheduled',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return labels[status] || status;
};

