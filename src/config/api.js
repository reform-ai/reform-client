/**
 * API Configuration
 * Uses environment variables for production, defaults to localhost for development
 */

const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return 'http://127.0.0.1:8000';
};

export const API_URL = getApiUrl();
export const API_ENDPOINTS = {
  UPLOAD_VIDEO: `${API_URL}/upload-video`,
  HEALTH: `${API_URL}/health`,
  ROOT: `${API_URL}/`,
  CHECK_ANONYMOUS_LIMIT: `${API_URL}/api/check-anonymous-limit`,
  SIGNUP: `${API_URL}/api/auth/signup`,
  LOGIN: `${API_URL}/api/auth/login`,
  ME: `${API_URL}/api/auth/me`,
  CHANGE_PASSWORD: `${API_URL}/api/auth/change-password`,
  UPDATE_USERNAME: `${API_URL}/api/auth/update-username`,
  UPDATE_PROFILE: `${API_URL}/api/auth/update-profile`,
  // Social feed endpoints
  FEED: `${API_URL}/api/social/feed`,
  POSTS: `${API_URL}/api/social/posts`,
  POST: (postId) => `${API_URL}/api/social/posts/${postId}`,
  DELETE_POST: (postId) => `${API_URL}/api/social/posts/${postId}`,
  POST_LIKE: (postId) => `${API_URL}/api/social/posts/${postId}/like`,
  POST_COMMENTS: (postId) => `${API_URL}/api/social/posts/${postId}/comments`,
  COMMENT: (commentId) => `${API_URL}/api/social/comments/${commentId}`,
  USER_FOLLOW: (username) => `${API_URL}/api/social/users/${username}/follow`,
  USER_FOLLOW_STATUS: (username) => `${API_URL}/api/social/users/${username}/follow`,
  USER_POSTS: (username) => `${API_URL}/api/social/users/${username}/posts`,
  PRIVACY: `${API_URL}/api/social/users/me/privacy`,
  MY_FOLLOWERS: `${API_URL}/api/social/users/me/followers`,
  MY_FOLLOWING: `${API_URL}/api/social/users/me/following`
};

// Only log API URL in development mode for security
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API URL:', API_URL);
  console.log('🔗 Upload endpoint:', API_ENDPOINTS.UPLOAD_VIDEO);
}

