/**
 * Base API configuration
 * Shared utilities and base URL
 */

const getApiUrl = () => {
  // Vite uses import.meta.env.VITE_* for environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://127.0.0.1:8000';
};

export const API_URL = getApiUrl();

