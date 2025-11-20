import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { getUserToken } from '../../utils/authStorage';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import ScoreBreakdown from '../ScoreBreakdown';
import AnglePlot from '../charts/AnglePlot';
import '../../styles/social/PostCard.css';

const PostCard = ({ post, currentUserId, currentUserEmail, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUserClick = () => {
    if (post.username) {
      navigate(`/profile/${post.username}`);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    const token = getUserToken();

    try {
      const response = await fetch(API_ENDPOINTS.DELETE_POST(post.id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete post');
      }

      // Call onDelete callback to refresh the feed
      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert(err.message || 'Failed to delete post');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isOwnPost = currentUserId && post.user_id === currentUserId;

  const renderPostContent = () => {
    if (post.post_type === 'score' && post.score_data) {
      return (
        <div className="post-score-content">
          <ScoreBreakdown
            formAnalysis={{ final_score: post.score_data }}
            componentScores={post.score_data.component_scores || {}}
            calculationResults={post.plot_config?.calculation_results}
            squatPhases={post.plot_config?.squat_phases}
            frameCount={post.plot_config?.frame_count}
            expandedStates={{}}
            onToggleExpanded={() => {}}
            fps={post.plot_config?.calculation_results?.fps || post.plot_config?.fps || null}
          />
          {post.plot_config && post.plot_config.angles_per_frame && (
            <details style={{ marginTop: '20px' }}>
              <summary className="plot-summary">
                📈 Angle Analysis Plots
              </summary>
              <div className="angle-analysis-plot-container" style={{ marginTop: '10px' }}>
                <AnglePlot
                  anglesPerFrame={post.plot_config.angles_per_frame}
                  frameCount={post.plot_config.frame_count}
                  squatPhases={post.plot_config.squat_phases}
                  fps={post.plot_config.calculation_results?.fps || post.plot_config.fps || 30}
                  calculationResults={post.plot_config.calculation_results}
                />
              </div>
            </details>
          )}
        </div>
      );
    } else if (post.post_type === 'text') {
      return (
        <div className="post-text-content">
          <p>{post.content}</p>
        </div>
      );
    } else if (post.post_type === 'plot' && post.plot_config) {
      return (
        <div className="post-plot-content">
          <AnglePlot
            anglesPerFrame={post.plot_config.angles_per_frame}
            frameCount={post.plot_config.frame_count}
            squatPhases={post.plot_config.squat_phases}
            fps={post.plot_config.calculation_results?.fps || post.plot_config.fps || 30}
            calculationResults={post.plot_config.calculation_results}
          />
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    
    // Handle both string and Date object
    let date;
    if (typeof dateValue === 'string') {
      // API returns UTC times without timezone indicator
      // If no 'Z' or timezone offset, treat as UTC by appending 'Z'
      let dateString = dateValue;
      if (!dateString.includes('Z') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
        dateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
      }
      // Parse as UTC and convert to local timezone
      date = new Date(dateString);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      // If it's an object with timestamp or other format, try to convert
      date = new Date(dateValue);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateValue, typeof dateValue);
      return '';
    }
    
    // Get current time in user's local timezone
    const now = new Date();
    
    // Calculate difference in milliseconds (both dates are in local timezone after parsing)
    const diffMs = now.getTime() - date.getTime();
    
    // If date is in the future (shouldn't happen, but handle gracefully), show the date
    if (diffMs < 0) {
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    }
    
    const diffMins = Math.floor(diffMs / 60000);

    // Under 1 minute: "just now"
    if (diffMins < 1) return 'just now';
    
    // 1-30 minutes: "x min ago"
    if (diffMins <= 30) return `${diffMins}m ago`;
    
    // Over 30 minutes: show actual date/time in user's local timezone
    // Using undefined for locale uses browser's locale, and automatically uses local timezone
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-user-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="post-username" 
              onClick={handleUserClick}
              disabled={!post.username}
            >
              {post.username || 'Unknown User'}
            </button>
            {post.user_email && post.user_email === process.env.REACT_APP_VERIFIED_EMAIL && (
              <img 
                src="https://images.credential.net/badge/tiny/kt0vexxs_1761580077325_badge.png" 
                alt="Verified Badge" 
                style={{
                  height: '20px',
                  width: 'auto',
                  verticalAlign: 'middle'
                }}
              />
            )}
          </div>
          <span className="post-time">{formatDate(post.created_at)}</span>
        </div>
        {isOwnPost && (
          <div className="post-actions-header">
            {!showDeleteConfirm ? (
              <button
                className="delete-post-button"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete post"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  fontSize: '0.9rem',
                  opacity: isDeleting ? 0.5 : 1
                }}
              >
                🗑️
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Delete?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.85rem',
                    background: 'var(--accent-orange)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.7 : 1
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Yes'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setIsDeleting(false);
                  }}
                  disabled={isDeleting}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.85rem',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    cursor: isDeleting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Show caption only for non-text posts (text posts show content in renderPostContent) */}
      {post.content && post.post_type !== 'text' && (
        <div className="post-caption">
          <p>{post.content}</p>
        </div>
      )}

      <div className="post-content">
        {renderPostContent()}
      </div>

      <div className="post-actions">
        <LikeButton 
          postId={post.id} 
          isLiked={post.is_liked} 
          likeCount={post.like_count}
          onUpdate={onUpdate}
        />
        <button 
          className="comment-button"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {post.comment_count}
        </button>
      </div>

      {showComments && (
        <CommentSection 
          postId={post.id} 
          currentUserId={currentUserId}
          currentUserEmail={currentUserEmail}
          onUpdate={onUpdate}
        />
      )}
    </article>
  );
};

export default PostCard;

