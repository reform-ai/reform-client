/**
 * Utility for making authenticated fetch requests with consistent error handling
 * 
 * @module authenticatedFetch
 */

import { clearUserData, isUserLoggedIn } from './authStorage';
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
import { getUserToken } from './authStorage';

export async function authenticatedFetch(url, options = {}, navigate = null, retryOn401 = true) {
  // Try cookies first (preferred), but also include Authorization header as fallback
  // Many browsers block third-party cookies, so we need both
  const token = getUserToken();
  const headers = {
    'Content-Type': 'application/json',
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
    // Only try refresh if user is marked as logged in (cookies might not be available yet)
    // If user is not logged in, don't try refresh - just fail
    if (!isUserLoggedIn()) {
      const error = await handleFetchError(response);
      throw error;
    }
    
    // Check if this might be a fresh login (cookies not yet available)
    // If login just happened, wait a bit for cookies to be processed
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    const now = Date.now();
    const timeSinceLogin = loginTimestamp ? now - parseInt(loginTimestamp, 10) : Infinity;
    const isFreshLogin = timeSinceLogin < 2000; // Less than 2 seconds since login
    
    if (isFreshLogin) {
      // Wait a bit for cookies to be processed by browser
      await new Promise(resolve => setTimeout(resolve, 500));
      // Retry the original request (cookies should be available now)
      response = await fetch(url, mergedOptions);
      
      // If still 401 after waiting, try refresh
      if (response.status === 401) {
        const refreshSucceeded = await refreshAccessToken();
        
        if (refreshSucceeded) {
          // Retry again with new token
          response = await fetch(url, mergedOptions);
          if (response.status === 401) {
            // Still 401 - clear and redirect
            await clearUserData();
            if (navigate) {
              navigate('/?login=1');
            }
            const error = await handleFetchError(response);
            throw error;
          }
        } else {
          // Refresh failed - but don't clear on fresh login, just throw error
          const error = await handleFetchError(response);
          throw error;
        }
      }
    } else {
      // Not a fresh login - proceed with normal refresh flow
      const refreshSucceeded = await refreshAccessToken();
      
      if (refreshSucceeded) {
        // Retry the original request with the new access token
        response = await fetch(url, mergedOptions);
        
        // If still 401 after refresh, token refresh failed or user is logged out
        if (response.status === 401) {
          // Only clear if user was actually logged in
          if (isUserLoggedIn()) {
            await clearUserData();
            if (navigate) {
              navigate('/?login=1');
            }
          }
          const error = await handleFetchError(response);
          throw error;
        }
      } else {
        // Refresh token is invalid or expired - only clear if user was logged in
        if (isUserLoggedIn()) {
          await clearUserData();
          if (navigate) {
            navigate('/?login=1');
          }
        }
        const error = await handleFetchError(response);
        throw error;
      }
    }
  } else if (response.status === 401) {
    // 401 but retryOn401 is false (e.g., refresh endpoint itself)
    // Only clear if user was actually logged in
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

