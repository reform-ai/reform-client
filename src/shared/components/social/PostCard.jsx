import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { getUserToken } from '../../utils/authStorage';
import { formatDate } from '../../utils/dateFormat';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import FollowButton from './FollowButton';
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


  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-user-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
            {!isOwnPost && post.username && (
              <FollowButton 
                username={post.username}
                initialFollowing={post.is_following}
                onUpdate={(following) => {
                  // Update post's follow status if callback provided
                  if (onUpdate) {
                    onUpdate({ ...post, is_following: following });
                  }
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

