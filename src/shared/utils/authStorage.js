/**
 * Helper functions for managing authentication data in localStorage
 */

/**
 * Stores user authentication data in localStorage after login/signup
 * Note: Tokens are now stored in httpOnly cookies, not localStorage
 * @param {Object} data - Response data from login/signup endpoint
 * @param {string} data.user_id - User ID
 * @param {string} data.email - User email
 * @param {string} data.full_name - User's full name
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
  // Store login timestamp to detect fresh logins
  localStorage.setItem('loginTimestamp', Date.now().toString());
};

/**
 * Clears all authentication data from localStorage
 * Also calls logout endpoint to clear httpOnly cookie
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
 * Checks if user is logged in
 * @returns {boolean}
 */
export const isUserLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

/**
 * Gets the user's authentication token
 * Returns token from localStorage as fallback for browsers that block third-party cookies
 * Cookies are preferred, but this provides a fallback
 * @returns {string|null} Access token from localStorage, or null if not available
 */
export const getUserToken = () => {
  // Return token from localStorage as fallback
  // Cookies are preferred, but many browsers block third-party cookies
  return localStorage.getItem('access_token');
};

