/**
 * Custom hook to require authentication for protected routes
 * 
 * Redirects to login page if user is not authenticated
 * 
 * @param {Function} navigate - React Router navigate function
 * @param {Function} callback - Optional callback to execute if authenticated (use useCallback)
 * @returns {boolean} Whether user is authenticated
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // Only depend on navigate, callback should be stable via useCallback
  
  return isUserLoggedIn();
}

