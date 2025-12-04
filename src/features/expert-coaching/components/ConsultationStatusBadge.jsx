import React from 'react';
import { createStatusBadgeStyle } from '../../../shared/styles/utils';

/**
 * ConsultationStatusBadge - Displays consultation status with color-coded badge
 * 
 * Shows the consultation status (pending, scheduled, completed, etc.) with appropriate
 * color coding based on the status value. Uses centralized status colors from the
 * styling system.
 * 
 * @param {Object} props
 * @param {string} props.status - Consultation status. Valid values: 'pending', 'pending_booking', 
 *   'scheduled', 'active', 'completed', 'cancelled'
 * @param {string} [props.size='medium'] - Badge size variant: 'small' | 'medium' | 'large'
 * 
 * @returns {JSX.Element} Styled status badge span element
 * 
 * @example
 * // Basic usage
 * <ConsultationStatusBadge status="scheduled" />
 * 
 * @example
 * // With custom size
 * <ConsultationStatusBadge status="pending_booking" size="large" />
 * 
 * @see {@link expertCoachingConstants} for status color mappings
 * @see {@link createStatusBadgeStyle} for styling implementation
 */
const ConsultationStatusBadge = ({ status, size = 'medium' }) => {
  return (
    <span style={createStatusBadgeStyle(status, size)}>
      {status}
    </span>
  );
};

export default ConsultationStatusBadge;

