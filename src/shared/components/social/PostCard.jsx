import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { authenticatedFetch } from '../../utils/authenticatedFetch';
import { formatDate } from '../../utils/dateFormat';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import FollowButton from './FollowButton';
import ScoreBreakdown from '../ScoreBreakdown';
import AnglePlot from '../charts/AnglePlot';
import ImageLightboxModal from '../modals/ImageLightboxModal';
import '../../styles/social/PostCard.css';

const PostCard = ({ post, currentUserId, currentUserEmail, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    try {
      await authenticatedFetch(
        API_ENDPOINTS.DELETE_POST(post.id),
        {
          method: 'DELETE',
        },
        navigate
      );

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

  const handleImageClick = (index) => {
    setLightboxImageIndex(index);
    setShowImageLightbox(true);
  };

  const handleImageNav = (direction, e) => {
    if (e) {
      e.stopPropagation();
    }
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => 
        prev === 0 ? (post.image_urls.length - 1) : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === post.image_urls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleDotClick = (index, e) => {
    if (e) {
      e.stopPropagation();
    }
    setCurrentImageIndex(index);
  };

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

      {/* Display images if present - show only one at a time with navigation */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className="post-images" style={{ marginBottom: '16px', position: 'relative' }}>
          {(() => {
            // Use thumbnails if available, fallback to full images
            const getThumbnail = (index) => {
              return (post.thumbnail_urls && post.thumbnail_urls[index]) || post.image_urls[index];
            };
            const getFullImage = (index) => post.image_urls[index];
            
            return (
              <div style={{ position: 'relative' }}>
                {/* Single image display */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={getThumbnail(currentImageIndex)}
                    alt={`Post image ${currentImageIndex + 1}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
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
                    onClick={() => handleImageClick(currentImageIndex)}
                    onError={(e) => {
                      // Fallback to full image if thumbnail fails
                      if (e.target.src !== getFullImage(currentImageIndex)) {
                        e.target.src = getFullImage(currentImageIndex);
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                  
                  {/* Navigation arrows (only show if multiple images) */}
                  {post.image_urls.length > 1 && (
                    <>
                      <button
                        onClick={(e) => handleImageNav('prev', e)}
                        style={{
                          position: 'absolute',
                          left: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: 'none',
                          color: 'white',
                          fontSize: '1.5rem',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s ease',
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                        aria-label="Previous image"
                      >
                        ‹
                      </button>
                      <button
                        onClick={(e) => handleImageNav('next', e)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: 'none',
                          color: 'white',
                          fontSize: '1.5rem',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s ease',
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                        aria-label="Next image"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
                
                {/* Navigation dots (only show if multiple images) */}
                {post.image_urls.length > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '12px',
                    padding: '0 10px'
                  }}>
                    {post.image_urls.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleDotClick(index, e)}
                        style={{
                          width: index === currentImageIndex ? '24px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          border: 'none',
                          background: index === currentImageIndex 
                            ? 'var(--accent-green, #27ae60)' 
                            : 'rgba(0, 0, 0, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          padding: 0
                        }}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
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

      {/* Image Lightbox Modal */}
      {post.image_urls && post.image_urls.length > 0 && (
        <ImageLightboxModal
          isOpen={showImageLightbox}
          images={post.image_urls}
          initialIndex={lightboxImageIndex}
          onClose={() => setShowImageLightbox(false)}
        />
      )}
    </article>
  );
};

export default PostCard;

