/**
 * Core API endpoints (video upload, health, etc.)
 */

import { API_URL } from './base';

export const coreEndpoints = {
  UPLOAD_VIDEO: `${API_URL}/upload-video`,
  UPLOAD_VIDEO_ONLY: `${API_URL}/upload-video-only`,
  ANALYZE_VIDEO: `${API_URL}/analyze-video`,
  HEALTH: `${API_URL}/health`,
  ROOT: `${API_URL}/`,
  CHECK_ANONYMOUS_LIMIT: `${API_URL}/api/check-anonymous-limit`,
};

