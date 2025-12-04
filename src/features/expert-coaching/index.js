/**
 * Expert Coaching Feature - Main Export
 * 
 * This module provides a centralized export point for all expert-coaching
 * related components, pages, and utilities.
 * 
 * Usage:
 *   import { ConsultationStatusBadge, formatScheduledStartTime } from '../features/expert-coaching';
 */

// Components
export { default as ConsultationStatusBadge } from './components/ConsultationStatusBadge';
export { default as ConsultationTimestamps } from './components/ConsultationTimestamps';
export { default as ConsultationScheduledTime } from './components/ConsultationScheduledTime';
export { default as PTBookingInfo } from './components/PTBookingInfo';
export { default as AcknowledgmentComponent } from './components/AcknowledgmentComponent';
export { default as PARQComponent } from './components/PARQComponent';

// Pages
export { default as ExpertCoachingPage } from './pages/ExpertCoachingPage';
export { default as ExpertCoachingRequestPage } from './pages/ExpertCoachingRequestPage';
export { default as ExpertCoachingVoucherPage } from './pages/ExpertCoachingVoucherPage';
export { default as ExpertCoachingBookingPage } from './pages/ExpertCoachingBookingPage';
export { default as ExpertCoachingConsultationsPage } from './pages/ExpertCoachingConsultationsPage';
export { default as ExpertCoachingDetailPage } from './pages/ExpertCoachingDetailPage';
export { default as PTExpertCoachingConsultationsPage } from './pages/PTExpertCoachingConsultationsPage';
export { default as PTExpertCoachingDetailPage } from './pages/PTExpertCoachingDetailPage';

// Utilities
export * from './utils/expertCoachingConstants';
export * from './utils/expertCoachingDateFormat';

