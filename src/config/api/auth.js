/**
 * Authentication API endpoints
 */

import { API_URL } from './base';

export const authEndpoints = {
  SIGNUP: `${API_URL}/api/auth/signup`,
  LOGIN: `${API_URL}/api/auth/login`,
  LOGOUT: `${API_URL}/api/auth/logout`,
  REFRESH: `${API_URL}/api/auth/refresh`,
  ME: `${API_URL}/api/auth/me`,
  CHANGE_PASSWORD: `${API_URL}/api/auth/change-password`,
  UPDATE_USERNAME: `${API_URL}/api/auth/update-username`,
  UPDATE_PROFILE: `${API_URL}/api/auth/update-profile`,
  SEND_VERIFICATION_EMAIL: `${API_URL}/api/auth/send-verification-email`,
  VERIFY_EMAIL: `${API_URL}/api/auth/verify-email`,
  VERIFICATION_STATUS: `${API_URL}/api/auth/verification-status`,
  // X (Twitter) OAuth endpoints
  X_LOGIN: `${API_URL}/api/auth/x/login`,
  X_OAUTH1_LOGIN: `${API_URL}/api/auth/x/oauth1/login`, // OAuth 1.0a login for media upload
};

