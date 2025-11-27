/**
 * API Configuration
 * Uses environment variables for production, defaults to localhost for development
 */

const getApiUrl = () => {
  // Vite uses import.meta.env.VITE_* for environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
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
  LOGOUT: `${API_URL}/api/auth/logout`,
  REFRESH: `${API_URL}/api/auth/refresh`,
  ME: `${API_URL}/api/auth/me`,
  CHANGE_PASSWORD: `${API_URL}/api/auth/change-password`,
  UPDATE_USERNAME: `${API_URL}/api/auth/update-username`,
  UPDATE_PROFILE: `${API_URL}/api/auth/update-profile`,
  SEND_VERIFICATION_EMAIL: `${API_URL}/api/auth/send-verification-email`,
  VERIFY_EMAIL: `${API_URL}/api/auth/verify-email`,
  VERIFICATION_STATUS: `${API_URL}/api/auth/verification-status`,
  // Social feed endpoints
  FEED: `${API_URL}/api/social/feed`,
  POSTS: `${API_URL}/api/social/posts`,
  POST: (postId) => `${API_URL}/api/social/posts/${postId}`,
  DELETE_POST: (postId) => `${API_URL}/api/social/posts/${postId}`,
  POST_LIKE: (postId) => `${API_URL}/api/social/posts/${postId}/like`,
  POST_COMMENTS: (postId) => `${API_URL}/api/social/posts/${postId}/comments`,
  POST_IMAGE_UPLOAD: `${API_URL}/api/social/posts/images/upload`,
  COMMENT: (commentId) => `${API_URL}/api/social/comments/${commentId}`,
  USER_FOLLOW: (username) => `${API_URL}/api/social/users/${username}/follow`,
  USER_FOLLOW_STATUS: (username) => `${API_URL}/api/social/users/${username}/follow`,
  USER_POSTS: (username) => `${API_URL}/api/social/users/${username}/posts`,
  USER_PROFILE: (username) => `${API_URL}/api/social/users/${username}/profile`,
  PRIVACY: `${API_URL}/api/social/users/me/privacy`,
  MY_FOLLOWERS: `${API_URL}/api/social/users/me/followers`,
  MY_FOLLOWING: `${API_URL}/api/social/users/me/following`,
  // Token endpoints
  TOKEN_BALANCE: `${API_URL}/api/tokens/balance`,
  TOKEN_TRANSACTIONS: `${API_URL}/api/tokens/transactions`,
  TOKEN_ACTIVATE: `${API_URL}/api/tokens/activate`,
  // Analysis endpoints
  ANALYSES: `${API_URL}/api/analyses`,
  ANALYSIS: (analysisId) => `${API_URL}/api/analyses/${analysisId}`,
  ANALYSIS_PROGRESS: `${API_URL}/api/analyses/progress/metrics`,
  ANALYSIS_GENERATE_SHARE_IMAGE: (analysisId) => `${API_URL}/api/analyses/${analysisId}/generate-share-image`,
  // Contact endpoint
  CONTACT_SUBMIT: `${API_URL}/api/contact/submit`,
  // X (Twitter) integration endpoints
  X_STATUS: `${API_URL}/api/x/status`,
  X_LOGIN: `${API_URL}/api/auth/x/login`,
  X_CONNECT: `${API_URL}/api/x/connect`, // Unified endpoint that checks status and returns appropriate OAuth URL
  X_DISCONNECT: `${API_URL}/api/x/disconnect`,
  X_POST: `${API_URL}/api/x/post`,
  X_POST_WITH_MEDIA: `${API_URL}/api/x/post-with-media`, // Old endpoint (httpx-based, OAuth 2.0 only)
  X_TWEEPY_POST_WITH_MEDIA: `${API_URL}/api/x/tweepy/post-with-media`, // New endpoint (tweepy-based, OAuth 1.0a + OAuth 2.0)
  X_OAUTH1_LOGIN: `${API_URL}/api/auth/x/oauth1/login`, // OAuth 1.0a login for media upload
  X_OAUTH1_STATUS: `${API_URL}/api/x/oauth1/status`, // Check OAuth 1.0a connection status
  // Workout plan endpoints
  WORKOUT_PLANS_QUESTIONNAIRE: `${API_URL}/api/workout-plans/questionnaire`,
  WORKOUT_PLANS_SUBMIT: `${API_URL}/api/workout-plans/questionnaire/submit`,
  WORKOUT_PLANS_GENERATE: `${API_URL}/api/workout-plans/generate`,
  WORKOUT_PLANS_ACTIVE: `${API_URL}/api/workout-plans/active`,
  WORKOUT_PLAN: (planId) => `${API_URL}/api/workout-plans/${planId}`,
  WORKOUT_PLAN_REGENERATE: (planId) => `${API_URL}/api/workout-plans/${planId}/regenerate`,
  WORKOUT_PLAN_DELETE: (planId) => `${API_URL}/api/workout-plans/${planId}`
};

// Only log API URL in development mode for security
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL);
  console.log('🔗 Upload endpoint:', API_ENDPOINTS.UPLOAD_VIDEO);
}

