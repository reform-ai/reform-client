import React from 'react';
import { formatScheduledStartTime, formatScheduledEndTime, formatConsultationTimestamp } from '../utils/expertCoachingDateFormat';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/styles/constants';
import { createButtonStyle } from '../../../shared/styles/utils';

/**
 * ConsultationScheduledTime - Displays scheduled consultation times in Eastern timezone
 * 
 * Shows the scheduled start and end times for a consultation. Always displays times
 * in Eastern timezone (America/New_York) for consistency across all views. Supports
 * multiple display variants for different use cases.
 * 
 * @param {Object} props
 * @param {Object} props.consultation - Consultation object
 * @param {string} props.consultation.scheduled_start_time - ISO timestamp of scheduled start (required)
 * @param {string} [props.consultation.scheduled_end_time] - ISO timestamp of scheduled end
 * @param {string} [props.consultation.booking_requested_at] - ISO timestamp when booking was requested
 * @param {string} [props.consultation.booking_confirmed_at] - ISO timestamp when booking was confirmed
 * @param {string} [props.consultation.meeting_link] - Google Meet link for the consultation
 * @param {string} [props.variant='full'] - Display variant: 'full' | 'compact' | 'inline'
 *   - 'full': Complete display with label, times, and meeting link (default)
 *   - 'compact': Simplified display with just times
 *   - 'inline': Inline text display for use in sentences
 * @param {Object} [props.style={}] - Optional inline styles to override default container styles
 * 
 * @returns {JSX.Element|null} Scheduled time display or null if consultation/scheduled_start_time is missing
 * 
 * @example
 * // Full variant (default)
 * <ConsultationScheduledTime consultation={consultationData} />
 * 
 * @example
 * // Compact variant for lists
 * <ConsultationScheduledTime 
 *   consultation={consultationData} 
 *   variant="compact" 
 * />
 * 
 * @example
 * // Inline variant for text
 * <p>
 *   Your consultation is scheduled for{' '}
 *   <ConsultationScheduledTime 
 *     consultation={consultationData} 
 *     variant="inline" 
 *   />
 * </p>
 * 
 * @see {@link expertCoachingDateFormat.formatScheduledStartTime} for start time formatting
 * @see {@link expertCoachingDateFormat.formatScheduledEndTime} for end time formatting
 */
const ConsultationScheduledTime = ({ consultation, variant = 'full', style = {} }) => {
  if (!consultation || !consultation.scheduled_start_time) return null;
  
  const startTime = formatScheduledStartTime(consultation.scheduled_start_time);
  const endTime = consultation.scheduled_end_time 
    ? formatScheduledEndTime(consultation.scheduled_end_time)
    : null;
  
  if (variant === 'inline') {
    return (
      <span style={style}>
        {startTime}
        {endTime && ` - ${endTime}`}
      </span>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div style={style}>
        <div style={{ 
          fontSize: TYPOGRAPHY.fontSize.base, 
          fontWeight: TYPOGRAPHY.fontWeight.semibold, 
          marginBottom: SPACING.xs 
        }}>
          {startTime}
        </div>
        {endTime && (
          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize.sm, 
            color: COLORS.text.secondary 
          }}>
            Until {endTime}
          </div>
        )}
      </div>
    );
  }
  
  // Full variant (default)
  return (
    <div style={style}>
      <div style={{ marginBottom: SPACING.xl }}>
        <div style={{
          fontSize: TYPOGRAPHY.fontSize.sm,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: COLORS.expertCoaching.confirmedText,
          marginBottom: SPACING.sm,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Scheduled Time
        </div>
        <div style={{
          fontSize: TYPOGRAPHY.fontSize['2xl'],
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: '#111827'
        }}>
          {startTime}
        </div>
        {endTime && (
          <div style={{
            fontSize: TYPOGRAPHY.fontSize.base,
            color: '#6b7280',
            marginTop: SPACING.xs
          }}>
            Until {endTime}
          </div>
        )}
      </div>
      
      {consultation.booking_requested_at && (
        <div style={{ 
          fontSize: TYPOGRAPHY.fontSize.sm, 
          color: '#6b7280', 
          marginTop: SPACING.md 
        }}>
          <strong>Requested:</strong> {formatConsultationTimestamp(consultation.booking_requested_at)}
        </div>
      )}
      
      {consultation.booking_confirmed_at && (
        <div style={{ 
          fontSize: TYPOGRAPHY.fontSize.sm, 
          color: '#6b7280', 
          marginTop: SPACING.sm 
        }}>
          <strong>Confirmed:</strong> {formatConsultationTimestamp(consultation.booking_confirmed_at)}
        </div>
      )}
      
      {consultation.meeting_link && (
        <div style={{ marginTop: SPACING.xl }}>
          <div style={{
            fontSize: TYPOGRAPHY.fontSize.sm,
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            color: COLORS.expertCoaching.confirmedText,
            marginBottom: SPACING.md,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Google Meet Link
          </div>
          <a
            href={consultation.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...createButtonStyle('success', {
                display: 'inline-flex',
                alignItems: 'center',
                gap: SPACING.sm,
                padding: `${SPACING.md} ${SPACING['2xl']}`,
                fontSize: TYPOGRAPHY.fontSize.base
              })
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.status.scheduled;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>🎥</span>
            Join Google Meet
          </a>
        </div>
      )}
    </div>
  );
};

export default ConsultationScheduledTime;

