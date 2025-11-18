/**
 * API Configuration
 * Uses environment variables for production, defaults to localhost for development
 */

const getApiUrl = () => {
  // In production, use REACT_APP_API_URL environment variable
  // In development, default to localhost
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to localhost for development
  return 'http://127.0.0.1:8000';
};

export const API_URL = getApiUrl();
export const API_ENDPOINTS = {
  UPLOAD_VIDEO: `${API_URL}/upload-video`,
  HEALTH: `${API_URL}/health`,
  ROOT: `${API_URL}/`
};

// Log API URL to help debug (works in both dev and production)
console.log('🔗 API URL:', API_URL);
console.log('🔗 Upload endpoint:', API_ENDPOINTS.UPLOAD_VIDEO);

