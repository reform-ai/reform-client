/**
 * Token Activation Utilities
 * 
 * Provides reusable functions for token activation functionality.
 * This module centralizes token activation logic so it can be used
 * across different components (UploadError, ProfilePage, etc.).
 * 
 * @module tokenActivation
 */

import { API_ENDPOINTS } from '../../config/api';
import { getUserToken } from './authStorage';

/**
 * Activates the user's token system and grants 10 free tokens.
 * This is a one-time activation that starts the monthly token cycle.
 * 
 * @returns {Promise<{success: boolean, message: string, data?: object}>}
 * @throws {Error} If activation fails
 */
export async function activateTokens() {
  const token = getUserToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in to activate tokens.');
  }

  const response = await fetch(API_ENDPOINTS.TOKEN_ACTIVATE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.detail || 'Failed to activate tokens';
    throw new Error(errorMessage);
  }

  return {
    success: true,
    message: 'Tokens activated! You received 10 free tokens.',
    data: data
  };
}

/**
 * Hook-like function for token activation with loading state management.
 * Can be used in React components to handle activation with state.
 * 
 * @param {Function} setLoading - State setter for loading state
 * @param {Function} setError - State setter for error messages
 * @param {Function} onSuccess - Optional callback on successful activation
 * @returns {Function} Activation handler function
 */
export function createActivationHandler(setLoading, setError, onSuccess = null) {
  return async () => {
    setError('');
    setLoading(true);

    try {
      const result = await activateTokens();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to activate tokens';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
}

