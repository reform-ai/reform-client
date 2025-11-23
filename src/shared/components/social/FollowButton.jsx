import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/api';
import { getUserToken } from '../../utils/authStorage';

/**
 * Follow button component
 * 
 * @param {Object} props
 * @param {string} props.username - Username of the user to follow/unfollow
 * @param {boolean} props.initialFollowing - Initial follow status (optional)
 * @param {Function} props.onUpdate - Callback when follow status changes (optional)
 * @param {boolean} props.isOwnProfile - Whether this is the current user's own profile (optional)
 */
const FollowButton = ({ username, initialFollowing = null, onUpdate, isOwnProfile = false }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(initialFollowing === null);

  // Fetch follow status if not provided
  useEffect(() => {
    if (initialFollowing === null && !isOwnProfile && username) {
      const fetchFollowStatus = async () => {
        const token = getUserToken();
        if (!token) {
          setIsChecking(false);
          return;
        }

        try {
          const response = await fetch(API_ENDPOINTS.USER_FOLLOW(username), {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setIsFollowing(data.following || false);
          } else if (response.status === 401) {
            // Unauthorized - token expired or invalid, don't show follow button
            console.warn('Unauthorized to check follow status');
            setIsFollowing(false);
          } else {
            // Other errors - default to not following
            console.warn('Failed to fetch follow status:', response.status);
            setIsFollowing(false);
          }
        } catch (err) {
          console.error('Error fetching follow status:', err);
          setIsFollowing(false);
        } finally {
          setIsChecking(false);
        }
      };

      fetchFollowStatus();
    } else {
      setIsChecking(false);
    }
  }, [username, initialFollowing, isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!username || isOwnProfile || isLoading) return;

    setIsLoading(true);
    const token = getUserToken();

    try {
      const response = await fetch(API_ENDPOINTS.USER_FOLLOW(username), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Failed to toggle follow';
        
        // If backend says "cannot follow yourself", this is the user's own profile
        if (errorMessage.toLowerCase().includes('cannot follow yourself') || 
            errorMessage.toLowerCase().includes('follow yourself')) {
          console.warn('[FollowButton] Backend detected own profile:', errorMessage);
          // Don't show alert, just silently fail - the button should be hidden by isOwnProfile
          return;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setIsFollowing(data.following);

      // Call update callback if provided
      if (onUpdate) {
        onUpdate(data.following);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      // Only show alert if it's not the "cannot follow yourself" error
      if (!err.message.toLowerCase().includes('cannot follow yourself') && 
          !err.message.toLowerCase().includes('follow yourself')) {
        alert(err.message || 'Failed to toggle follow');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for own profile
  if (isOwnProfile) {
    return null;
  }

  // Show loading state while checking
  if (isChecking) {
    return (
      <button
        disabled
        style={{
          padding: '6px 16px',
          fontSize: '0.9rem',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          cursor: 'not-allowed',
          opacity: 0.6
        }}
      >
        ...
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      style={{
        padding: '6px 16px',
        fontSize: '0.9rem',
        fontWeight: '500',
        background: isFollowing 
          ? 'var(--bg-tertiary)' 
          : 'var(--primary-color, #4CAF50)',
        color: isFollowing 
          ? 'var(--text-primary)' 
          : 'white',
        border: isFollowing 
          ? '1px solid var(--border-color)' 
          : 'none',
        borderRadius: '6px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        transition: 'all 0.2s ease'
      }}
    >
      {isLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
    </button>
  );
};

export default FollowButton;

