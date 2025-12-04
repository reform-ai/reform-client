/**
 * Custom hook to require authentication for protected routes.
 * 
 * Checks if user is authenticated and redirects to login page if not.
 * Can optionally execute a callback when authentication is confirmed.
 * 
 * @param {Function} navigate - React Router navigate function from useNavigate()
 * @param {Function} [callback] - Optional callback to execute if authenticated.
 *   Use useCallback() to memoize the callback to avoid unnecessary re-runs.
 * @returns {boolean} Whether user is authenticated
 * 
 * @example
 * // Basic usage
 * const navigate = useNavigate();
 * const isAuthenticated = useRequireAuth(navigate);
 * 
 * @example
 * // With callback
 * const navigate = useNavigate();
 * const loadData = useCallback(() => {
 *   fetchUserData();
 * }, []);
 * const isAuthenticated = useRequireAuth(navigate, loadData);
 * 
 * @note This is a hook and must be called at the top level of a React component
 */
import { useEffect } from 'react';
import { isUserLoggedIn } from './authStorage';

export function useRequireAuth(navigate, callback = null) {
  useEffect(() => {
    if (!isUserLoggedIn()) {
      navigate('/?login=1');
      return;
    }
    
    if (callback) {
      callback();
    }
  }, [navigate, callback]); // Include callback in dependencies
  
  return isUserLoggedIn();
}

