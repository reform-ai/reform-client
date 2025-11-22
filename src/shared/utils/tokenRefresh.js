/**
 * Token refresh utility
 * 
 * Handles automatic token refresh when access token expires
 * 
 * @module tokenRefresh
 */

import { API_ENDPOINTS } from '../../config/api';

let isRefreshing = false;
let refreshPromise = null;

/**
 * Refreshes the access token using the refresh token
 * Uses a singleton pattern to prevent multiple simultaneous refresh requests
 * 
 * @returns {Promise<boolean>} True if refresh succeeded, false otherwise
 */
export async function refreshAccessToken() {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(API_ENDPOINTS.REFRESH, {
        method: 'POST',
        credentials: 'include', // Important: include cookies
      });

      if (response.ok) {
        return true;
      } else {
        // Refresh token is invalid or expired
        return false;
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

