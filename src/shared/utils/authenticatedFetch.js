/**
 * Utility for making authenticated fetch requests with consistent error handling
 * 
 * @module authenticatedFetch
 */

import { clearUserData } from './authStorage';
import { handleFetchError } from './apiErrorHandler';
import { refreshAccessToken } from './tokenRefresh';

/**
 * Makes an authenticated fetch request with automatic token handling and refresh
 * Tokens are now stored in httpOnly cookies, so we use credentials: 'include'
 * 
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options (method, body, headers, etc.)
 * @param {Function} navigate - Optional navigate function for 401 redirects
 * @param {boolean} retryOn401 - Whether to retry with refreshed token on 401 (default: true)
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} If request fails or user is not authenticated
 */
export async function authenticatedFetch(url, options = {}, navigate = null, retryOn401 = true) {
  // Tokens are now in httpOnly cookies, so we need credentials: 'include'
  const mergedOptions = {
    ...options,
    credentials: 'include', // Important: include cookies with request
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  let response = await fetch(url, mergedOptions);

  // Handle 401 Unauthorized - try to refresh token first
  if (response.status === 401 && retryOn401) {
    // Try to refresh the access token
    const refreshSucceeded = await refreshAccessToken();
    
    if (refreshSucceeded) {
      // Retry the original request with the new access token
      response = await fetch(url, mergedOptions);
      
      // If still 401 after refresh, token refresh failed or user is logged out
      if (response.status === 401) {
        await clearUserData();
        if (navigate) {
          navigate('/?login=1');
        }
        const error = await handleFetchError(response);
        throw error;
      }
    } else {
      // Refresh token is invalid or expired - user needs to log in again
      await clearUserData();
      if (navigate) {
        navigate('/?login=1');
      }
      const error = await handleFetchError(response);
      throw error;
    }
  } else if (response.status === 401) {
    // 401 but retryOn401 is false (e.g., refresh endpoint itself)
    await clearUserData();
    if (navigate) {
      navigate('/?login=1');
    }
    const error = await handleFetchError(response);
    throw error;
  }

  // Handle other errors
  if (!response.ok) {
    const error = await handleFetchError(response);
    throw error;
  }

  return response;
}

/**
 * Makes an authenticated fetch request and parses JSON response
 * 
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {Function} navigate - Optional navigate function for 401 redirects
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} If request fails or user is not authenticated
 */
export async function authenticatedFetchJson(url, options = {}, navigate = null) {
  const response = await authenticatedFetch(url, options, navigate);
  return await response.json();
}

