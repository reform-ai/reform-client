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
            {post.is_pt && (
              <img 
                src="https://images.credential.net/badge/tiny/kt0vexxs_1761580077325_badge.png" 
                alt="Verified Personal Trainer" 
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
                isOwnProfile={isOwnPost}
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
              <div className="delete-confirm-container">
                <span className="delete-confirm-text">Delete?</span>
                <div className="delete-confirm-buttons">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="delete-confirm-yes"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setIsDeleting(false);
                    }}
                    disabled={isDeleting}
                    className="delete-confirm-cancel"
                  >
                    Cancel
                  </button>
                </div>
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

      {/* Display images if present */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className="post-images" style={{ marginBottom: '16px' }}>
          {(() => {
            // Use thumbnails if available, fallback to full images
            const getThumbnail = (index) => {
              return (post.thumbnail_urls && post.thumbnail_urls[index]) || post.image_urls[index];
            };
            const getFullImage = (index) => post.image_urls[index];
            
            if (post.image_urls.length === 1) {
              // Single image - full width, use thumbnail for display
              return (
                <img
                  src={getThumbnail(0)}
                  alt="Post image"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    display: 'block',
                    margin: '0 auto'
                  }}
                  onClick={() => window.open(getFullImage(0), '_blank')}
                  onError={(e) => {
                    // Fallback to full image if thumbnail fails
                    if (e.target.src !== getFullImage(0)) {
                      e.target.src = getFullImage(0);
                    } else {
                      e.target.style.display = 'none';
                    }
                  }}
                />
              );
            } else if (post.image_urls.length === 2) {
              // Two images - side by side
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {post.image_urls.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={getThumbnail(index)}
                      alt={`Post image ${index + 1}`}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-tertiary)',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(getFullImage(index), '_blank')}
                      onError={(e) => {
                        // Fallback to full image if thumbnail fails
                        if (e.target.src !== getFullImage(index)) {
                          e.target.src = getFullImage(index);
                        } else {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  ))}
                </div>
              );
            } else if (post.image_urls.length === 3) {
              // Three images - 2 on top, 1 on bottom
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <img
                    src={getThumbnail(0)}
                    alt="Post image 1"
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-tertiary)',
                      cursor: 'pointer',
                      gridRow: 'span 2'
                    }}
                    onClick={() => window.open(getFullImage(0), '_blank')}
                    onError={(e) => {
                      if (e.target.src !== getFullImage(0)) {
                        e.target.src = getFullImage(0);
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                  <img
                    src={getThumbnail(1)}
                    alt="Post image 2"
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-tertiary)',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(getFullImage(1), '_blank')}
                    onError={(e) => {
                      if (e.target.src !== getFullImage(1)) {
                        e.target.src = getFullImage(1);
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                  <img
                    src={getThumbnail(2)}
                    alt="Post image 3"
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-tertiary)',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(getFullImage(2), '_blank')}
                    onError={(e) => {
                      if (e.target.src !== getFullImage(2)) {
                        e.target.src = getFullImage(2);
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                </div>
              );
            } else {
              // Four or more images - grid layout
              return (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: post.image_urls.length === 4 ? '1fr 1fr' : 'repeat(3, 1fr)',
                  gap: '8px'
                }}>
                  {post.image_urls.slice(0, 6).map((imageUrl, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={getThumbnail(index)}
                        alt={`Post image ${index + 1}`}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(getFullImage(index), '_blank')}
                        onError={(e) => {
                          // Fallback to full image if thumbnail fails
                          if (e.target.src !== getFullImage(index)) {
                            e.target.src = getFullImage(index);
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                      {index === 5 && post.image_urls.length > 6 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(getFullImage(index), '_blank')}
                        >
                          +{post.image_urls.length - 6}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            }
          })()}
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

