/**
 * Expert Coaching API endpoints
 */

import { API_URL } from './base';

export const expertCoachingEndpoints = {
  EXPERT_COACHING_VALIDATE_VOUCHER: `${API_URL}/api/expert-coaching/validate-voucher`,
  EXPERT_COACHING_REQUEST: `${API_URL}/api/expert-coaching/request`,
  EXPERT_COACHING_CONSULTATIONS: `${API_URL}/api/expert-coaching/consultations`,
  EXPERT_COACHING_CONSULTATION: (consultationId) => `${API_URL}/api/expert-coaching/consultations/${consultationId}`,
  EXPERT_COACHING_UPDATE: (consultationId) => `${API_URL}/api/expert-coaching/consultations/${consultationId}`,
  EXPERT_COACHING_ACKNOWLEDGE: (consultationId) => `${API_URL}/api/expert-coaching/consultations/${consultationId}/acknowledge`,
  EXPERT_COACHING_PARQ_QUESTIONS: `${API_URL}/api/expert-coaching/parq-questions`,
  EXPERT_COACHING_PARQ_SUBMIT: (consultationId) => `${API_URL}/api/expert-coaching/consultations/${consultationId}/parq`,
  EXPERT_COACHING_AVAILABILITY: `${API_URL}/api/expert-coaching/availability`,
  EXPERT_COACHING_BOOK: (consultationId) => `${API_URL}/api/expert-coaching/consultations/${consultationId}/book`,
  // PT (Personal Trainer) endpoints for managing consultations
  PT_EXPERT_COACHING_CONSULTATIONS: `${API_URL}/api/admin/expert-coaching/consultations`,
  PT_EXPERT_COACHING_CONSULTATION: (consultationId) => `${API_URL}/api/admin/expert-coaching/consultations/${consultationId}`,
  PT_EXPERT_COACHING_UPDATE_STATUS: (consultationId) => `${API_URL}/api/admin/expert-coaching/consultations/${consultationId}/status`,
};

