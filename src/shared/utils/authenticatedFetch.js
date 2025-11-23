/**
 * Utility for making authenticated fetch requests with consistent error handling
 * 
 * Supports both httpOnly cookies (preferred) and Authorization header (fallback)
 * for browsers that block third-party cookies.
 * 
 * @module authenticatedFetch
 */

import { clearUserData, isUserLoggedIn, getUserToken } from './authStorage';
import { handleFetchError } from './apiErrorHandler';
import { refreshAccessToken } from './tokenRefresh';

/**
 * Makes an authenticated fetch request with automatic token handling and refresh
 * 
 * Uses both httpOnly cookies (preferred) and Authorization header (fallback) to support
 * browsers that block third-party cookies. Automatically refreshes expired tokens.
 * 
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options (method, body, headers, etc.)
 * @param {Function} navigate - Optional navigate function for 401 redirects
 * @param {boolean} retryOn401 - Whether to retry with refreshed token on 401 (default: true)
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} If request fails or user is not authenticated
 */

export async function authenticatedFetch(url, options = {}, navigate = null, retryOn401 = true) {
  // Try cookies first (preferred), but also include Authorization header as fallback
  // Many browsers block third-party cookies, so we need both
  const token = getUserToken();
  
  // Don't set Content-Type for FormData - browser will set it with boundary
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };
  
  // Add Authorization header as fallback if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const mergedOptions = {
    ...options,
    credentials: 'include', // Important: include cookies with request
    headers,
  };

  let response = await fetch(url, mergedOptions);

  // Handle 401 Unauthorized - try to refresh token first
  if (response.status === 401 && retryOn401) {
    // Only try refresh if user is marked as logged in
    if (!isUserLoggedIn()) {
      const error = await handleFetchError(response);
      throw error;
    }
    
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
      // Refresh token is invalid or expired - clear user data and redirect
      await clearUserData();
      if (navigate) {
        navigate('/?login=1');
      }
      const error = await handleFetchError(response);
      throw error;
    }
  } else if (response.status === 401) {
    // 401 but retryOn401 is false (e.g., refresh endpoint itself)
    if (isUserLoggedIn()) {
      await clearUserData();
      if (navigate) {
        navigate('/?login=1');
      }
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

