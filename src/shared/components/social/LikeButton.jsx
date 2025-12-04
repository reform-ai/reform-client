import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { authenticatedFetchJson } from '../../utils/authenticatedFetch';

/**
 * LikeButton - Interactive like button for social posts
 * 
 * Displays a like button with current like count. Toggles like status on click
 * and updates the UI optimistically. Handles loading states and error handling.
 * 
 * @param {Object} props
 * @param {string|number} props.postId - ID of the post to like/unlike
 * @param {boolean} props.isLiked - Initial liked state
 * @param {number} props.likeCount - Initial like count
 * @param {Function} [props.onUpdate] - Optional callback invoked after like status changes
 * 
 * @returns {JSX.Element} Like button with count display
 * 
 * @example
 * <LikeButton 
 *   postId={post.id}
 *   isLiked={post.is_liked}
 *   likeCount={post.like_count}
 *   onUpdate={() => refreshPost()}
 * />
 * 
 * @see {@link authenticatedFetchJson} for API call implementation
 */
const LikeButton = ({ postId, isLiked: initialIsLiked, likeCount: initialLikeCount, onUpdate }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.POST_LIKE(postId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        navigate
      );

      setIsLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className="like-button"
      onClick={handleLike}
      disabled={isLoading}
      style={{
        background: 'none',
        border: 'none',
        color: isLiked ? 'var(--accent-green)' : 'var(--text-secondary)',
        cursor: isLoading ? 'wait' : 'pointer',
        fontSize: '0.9rem',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.target.style.background = 'var(--bg-tertiary)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'none';
      }}
    >
      {isLiked ? '❤️' : '🤍'} {likeCount}
    </button>
  );
};

export default LikeButton;

