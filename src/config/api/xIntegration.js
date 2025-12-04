/**
 * X (Twitter) integration API endpoints
 */

import { API_URL } from './base';

export const xIntegrationEndpoints = {
  X_STATUS: `${API_URL}/api/x/status`,
  X_CONNECT: `${API_URL}/api/x/connect`, // Unified endpoint that checks status and returns appropriate OAuth URL
  X_DISCONNECT: `${API_URL}/api/x/disconnect`,
  X_POST: `${API_URL}/api/x/post`,
  X_POST_WITH_MEDIA: `${API_URL}/api/x/post-with-media`, // Old endpoint (httpx-based, OAuth 2.0 only)
  X_TWEEPY_POST_WITH_MEDIA: `${API_URL}/api/x/tweepy/post-with-media`, // New endpoint (tweepy-based, OAuth 1.0a + OAuth 2.0)
  X_OAUTH1_STATUS: `${API_URL}/api/x/oauth1/status`, // Check OAuth 1.0a connection status
};

