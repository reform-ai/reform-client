/**
 * Authentication Storage Utilities
 * 
 * Manages user authentication data in localStorage. Supports both httpOnly cookies
 * (preferred) and localStorage tokens (fallback for browsers that block third-party cookies).
 * 
 * @module authStorage
 */

/**
 * Stores user authentication data in localStorage after login/signup.
 * 
 * Note: Tokens are primarily stored in httpOnly cookies (preferred), but access_token
 * is also stored in localStorage as a fallback for browsers that block third-party cookies.
 * 
 * @param {Object} data - Response data from login/signup endpoint
 * @param {string} data.user_id - User ID
 * @param {string} data.email - User email
 * @param {string} data.full_name - User's full name
 * @param {string} [data.access_token] - Access token (stored as fallback)
 * @param {string} [data.first_name] - First name (if provided directly)
 * @param {string} [data.last_name] - Last name (if provided directly)
 * 
 * @example
 * storeUserData({
 *   user_id: '123',
 *   email: 'user@example.com',
 *   full_name: 'John Doe',
 *   access_token: 'token123'
 * });
 */
export const storeUserData = (data) => {
  // Store access token temporarily as fallback for browsers that block third-party cookies
  // Cookies are preferred, but we need a fallback
  if (data.access_token) {
  localStorage.setItem('access_token', data.access_token);
  }
  
  // Store user ID (keeping both for backward compatibility)
  localStorage.setItem('userId', data.user_id);
  localStorage.setItem('user_id', data.user_id);
  
  // Store email (keeping both for backward compatibility)
  localStorage.setItem('userEmail', data.email);
  localStorage.setItem('user_email', data.email);
  
  // Store full name (keeping both for backward compatibility)
  localStorage.setItem('userName', data.full_name);
  localStorage.setItem('user_name', data.full_name);
  
  // Parse and store first/last name
  const nameParts = data.full_name ? data.full_name.trim().split(/\s+/) : [];
  if (nameParts.length >= 2) {
    localStorage.setItem('firstName', nameParts[0]);
    localStorage.setItem('lastName', nameParts.slice(1).join(' '));
  } else if (nameParts.length === 1) {
    localStorage.setItem('firstName', nameParts[0]);
    localStorage.setItem('lastName', '');
  } else if (data.first_name && data.last_name) {
    // If first_name and last_name are provided directly (e.g., from signup)
    localStorage.setItem('firstName', data.first_name);
    localStorage.setItem('lastName', data.last_name);
  }
  
  // Mark as logged in
  localStorage.setItem('isLoggedIn', 'true');
};

/**
 * Clears all authentication data from localStorage and httpOnly cookies.
 * 
 * Removes all stored user data and calls the logout endpoint to clear server-side
 * httpOnly cookies. This should be called on logout or when authentication fails.
 * 
 * @returns {Promise<void>} Resolves when cleanup is complete
 * 
 * @example
 * await clearUserData();
 */
export const clearUserData = async () => {
  // Clear localStorage first
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userToken');
  localStorage.removeItem('access_token');
  localStorage.removeItem('userId');
  localStorage.removeItem('user_id');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('user_email');
  localStorage.removeItem('userName');
  localStorage.removeItem('user_name');
  localStorage.removeItem('firstName');
  localStorage.removeItem('lastName');
  
  // Clear httpOnly cookie by calling logout endpoint
  try {
    const { API_ENDPOINTS } = await import('../../config/api');
    await fetch(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      credentials: 'include', // Important: include cookies
    });
  } catch (err) {
    // Silently fail - cookie will expire naturally
    console.warn('Failed to call logout endpoint:', err);
  }
};

/**
 * Checks if user is currently logged in.
 * 
 * Determines login status based on localStorage flag. Note that this doesn't
 * verify token validity - use authenticated API calls to verify actual authentication.
 * 
 * @returns {boolean} True if user is marked as logged in, false otherwise
 * 
 * @example
 * if (isUserLoggedIn()) {
 *   // Show authenticated UI
 * }
 */
export const isUserLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

/**
 * Gets the user's authentication token from localStorage.
 * 
 * Returns the access token stored in localStorage. This is used as a fallback
 * for browsers that block third-party cookies. Cookies (httpOnly) are preferred,
 * but this provides a fallback mechanism.
 * 
 * @returns {string|null} Access token from localStorage, or null if not available
 * 
 * @example
 * const token = getUserToken();
 * if (token) {
 *   headers['Authorization'] = `Bearer ${token}`;
 * }
 */
export const getUserToken = () => {
  // Return token from localStorage as fallback
  // Cookies are preferred, but many browsers block third-party cookies
  return localStorage.getItem('access_token');
};

