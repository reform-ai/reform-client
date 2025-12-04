import React from 'react';
import { formatScheduledStartTime, formatScheduledEndTime, formatConsultationTimestamp } from '../utils/expertCoachingDateFormat';
import { createBookingInfoStyle, createBookingTextColors } from '../../../shared/styles/utils';
import { SPACING, TYPOGRAPHY, COLORS, BORDER_RADIUS } from '../../../shared/styles/constants';

/**
 * PTBookingInfo - Displays booking information for Personal Trainer view
 * 
 * Shows detailed booking information specifically designed for the PT view,
 * including scheduled times (in Eastern timezone), booking status, meeting links,
 * and confirmation timestamps. Only renders for consultations with status
 * 'pending_booking' or 'scheduled'.
 * 
 * @param {Object} props
 * @param {Object} props.consultation - Consultation object
 * @param {string} props.consultation.status - Consultation status (must be 'pending_booking' or 'scheduled')
 * @param {string} [props.consultation.scheduled_start_time] - ISO timestamp of scheduled start
 * @param {string} [props.consultation.scheduled_end_time] - ISO timestamp of scheduled end
 * @param {string} [props.consultation.booking_requested_at] - ISO timestamp when booking was requested
 * @param {string} [props.consultation.booking_confirmed_at] - ISO timestamp when booking was confirmed
 * @param {string} [props.consultation.meeting_link] - Google Meet link for the consultation
 * 
 * @returns {JSX.Element|null} Booking info display or null if consultation is invalid/missing
 * 
 * @example
 * // Basic usage
 * <PTBookingInfo consultation={consultationData} />
 * 
 * @note Only displays for consultations with status 'pending_booking' or 'scheduled'
 * @see {@link expertCoachingDateFormat} for time formatting utilities
 * @see {@link createBookingInfoStyle} for styling implementation
 */
const PTBookingInfo = ({ consultation }) => {
  if (!consultation || (consultation.status !== 'pending_booking' && consultation.status !== 'scheduled')) {
    return null;
  }
  
  const isPending = consultation.status === 'pending_booking';
  const bookingStyle = createBookingInfoStyle(isPending);
  const { textColor, textColorLight } = createBookingTextColors(isPending);
  
  return (
    <div style={{ 
      ...bookingStyle,
      marginBottom: SPACING['2xl']
    }}>
      <h3 style={{ 
        fontSize: TYPOGRAPHY.fontSize.lg, 
        marginBottom: SPACING.lg, 
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: textColor
      }}>
        {isPending ? '📅 Booking Request Pending' : '✅ Booking Confirmed'}
      </h3>
      
      {consultation.scheduled_start_time && (
        <div style={{ marginBottom: SPACING.md }}>
          <strong style={{ color: textColor }}>
            Scheduled Start:
          </strong>
          <p style={{ 
            margin: `${SPACING.xs} 0 0 0`,
            color: textColorLight
          }}>
            {formatScheduledStartTime(consultation.scheduled_start_time)}
          </p>
        </div>
      )}
      
      {consultation.scheduled_end_time && (
        <div style={{ marginBottom: SPACING.md }}>
          <strong style={{ color: textColor }}>
            Scheduled End:
          </strong>
          <p style={{ 
            margin: `${SPACING.xs} 0 0 0`,
            color: textColorLight
          }}>
            {formatScheduledEndTime(consultation.scheduled_end_time)}
          </p>
        </div>
      )}
      
      {consultation.booking_requested_at && (
        <div style={{ marginBottom: SPACING.md, fontSize: TYPOGRAPHY.fontSize.sm }}>
          <strong style={{ color: textColor }}>
            Requested:
          </strong>
          <span style={{ 
            marginLeft: SPACING.sm,
            color: textColorLight
          }}>
            {formatConsultationTimestamp(consultation.booking_requested_at)}
          </span>
        </div>
      )}
      
      {consultation.meeting_link && (
        <div style={{ 
          marginTop: SPACING.lg,
          padding: SPACING.md,
          backgroundColor: isPending ? COLORS.expertCoaching.pendingBg : '#ffffff',
          borderRadius: BORDER_RADIUS.md,
          border: `1px solid ${COLORS.status.scheduled}`
        }}>
          <strong style={{ 
            color: COLORS.expertCoaching.confirmedText, 
            display: 'block', 
            marginBottom: SPACING.sm 
          }}>
            Google Meet Link:
          </strong>
          <a
            href={consultation.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: COLORS.status.scheduled,
              textDecoration: 'none',
              wordBreak: 'break-all',
              fontSize: TYPOGRAPHY.fontSize.sm,
              fontWeight: TYPOGRAPHY.fontWeight.medium
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            {consultation.meeting_link}
          </a>
        </div>
      )}
      
      {consultation.booking_confirmed_at && (
        <div style={{ marginTop: SPACING.md, fontSize: TYPOGRAPHY.fontSize.sm }}>
          <strong style={{ color: textColor }}>Confirmed:</strong>
          <span style={{ marginLeft: SPACING.sm, color: textColorLight }}>
            {formatConsultationTimestamp(consultation.booking_confirmed_at)}
          </span>
        </div>
      )}
    </div>
  );
};

export default PTBookingInfo;

