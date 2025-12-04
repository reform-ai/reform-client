/**
 * Social feed API endpoints
 */

import { API_URL } from './base';

export const socialEndpoints = {
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
};

