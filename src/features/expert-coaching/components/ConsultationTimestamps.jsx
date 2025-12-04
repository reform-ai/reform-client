import React from 'react';
import { formatConsultationTimestamp } from '../utils/expertCoachingDateFormat';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/styles/constants';

/**
 * ConsultationTimestamps - Displays consultation lifecycle timestamps
 * 
 * Shows all relevant timestamps for a consultation including created, started,
 * completed, and cancelled times. All timestamps are displayed in the user's
 * local timezone using the formatConsultationTimestamp utility.
 * 
 * @param {Object} props
 * @param {Object} props.consultation - Consultation object containing timestamp fields
 * @param {string} [props.consultation.created_at] - ISO timestamp when consultation was created
 * @param {string} [props.consultation.started_at] - ISO timestamp when consultation started
 * @param {string} [props.consultation.completed_at] - ISO timestamp when consultation completed
 * @param {string} [props.consultation.cancelled_at] - ISO timestamp when consultation was cancelled
 * @param {Object} [props.style={}] - Optional inline styles to override default container styles
 * 
 * @returns {JSX.Element|null} Timestamp display container or null if consultation is not provided
 * 
 * @example
 * <ConsultationTimestamps consultation={consultationData} />
 * 
 * @example
 * // With custom styling
 * <ConsultationTimestamps 
 *   consultation={consultationData}
 *   style={{ backgroundColor: '#f0f0f0' }}
 * />
 * 
 * @see {@link expertCoachingDateFormat.formatConsultationTimestamp} for timestamp formatting
 */
const ConsultationTimestamps = ({ consultation, style = {} }) => {
  if (!consultation) return null;
  
  const defaultStyle = {
    padding: SPACING.lg,
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    ...style
  };
  
  return (
    <div style={defaultStyle}>
      {consultation.created_at && (
        <div style={{ marginBottom: SPACING.sm }}>
          <strong>Created:</strong> {formatConsultationTimestamp(consultation.created_at)}
        </div>
      )}
      {consultation.started_at && (
        <div style={{ marginBottom: SPACING.sm }}>
          <strong>Started:</strong> {formatConsultationTimestamp(consultation.started_at)}
        </div>
      )}
      {consultation.completed_at && (
        <div style={{ marginBottom: SPACING.sm }}>
          <strong>Completed:</strong> {formatConsultationTimestamp(consultation.completed_at)}
        </div>
      )}
      {consultation.cancelled_at && (
        <div>
          <strong>Cancelled:</strong> {formatConsultationTimestamp(consultation.cancelled_at)}
        </div>
      )}
    </div>
  );
};

export default ConsultationTimestamps;

