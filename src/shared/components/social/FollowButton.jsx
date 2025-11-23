import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { authenticatedFetchJson } from '../../utils/authenticatedFetch';
import { isUserLoggedIn } from '../../utils/authStorage';

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
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(initialFollowing === null);

  // Fetch follow status if not provided
  useEffect(() => {
    // Only check follow status if user is logged in and not own profile
    if (initialFollowing === null && !isOwnProfile && username && isUserLoggedIn()) {
      const fetchFollowStatus = async () => {
        try {
          const data = await authenticatedFetchJson(
            API_ENDPOINTS.USER_FOLLOW(username),
            {},
            navigate
          );
          setIsFollowing(data.following || false);
        } catch (err) {
          // Silently fail on 401 (expected when not logged in or token expired)
          // Only log unexpected errors
          const isUnauthorized = err.message && (
            err.message.includes('401') || 
            err.message.includes('Unauthorized') ||
            err.message.includes('Authentication required')
          );
          if (!isUnauthorized) {
            console.warn('Error fetching follow status:', err.message);
          }
          setIsFollowing(false);
        } finally {
          setIsChecking(false);
        }
      };

      fetchFollowStatus();
    } else {
      setIsChecking(false);
    }
  }, [username, initialFollowing, isOwnProfile, navigate]);

  const handleToggleFollow = async () => {
    if (!username || isOwnProfile || isLoading) return;

    setIsLoading(true);

    try {
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.USER_FOLLOW(username),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        navigate
      );

      setIsFollowing(data.following);

      // Call update callback if provided
      if (onUpdate) {
        onUpdate(data.following);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      
      // If backend says "cannot follow yourself", this is the user's own profile
      const errorMessage = err.message || 'Failed to toggle follow';
      if (errorMessage.toLowerCase().includes('cannot follow yourself') || 
          errorMessage.toLowerCase().includes('follow yourself')) {
        console.warn('[FollowButton] Backend detected own profile:', errorMessage);
        // Don't show alert, just silently fail - the button should be hidden by isOwnProfile
        return;
      }
      
      // Show alert for other errors
      alert(errorMessage);
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

