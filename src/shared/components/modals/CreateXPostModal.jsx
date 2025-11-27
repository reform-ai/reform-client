import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { authenticatedFetchJson } from '../../utils/authenticatedFetch';
import '../../styles/social/CreatePostModal.css';

const CreateXPostModal = ({ 
  isOpen, 
  onClose, 
  onPostCreated, 
  preloadedImageUrl, 
  prefilledCaption,
  xStatus 
}) => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle modal open/close and preloaded data
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setError('');
      return;
    }

    // Handle prefilled caption when modal opens
    if (prefilledCaption) {
      setContent(prefilledCaption);
    } else {
      setContent('');
    }
  }, [isOpen, prefilledCaption]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Validate content (X has 280 character limit)
    if (!content.trim() && !preloadedImageUrl) {
      setError('Please enter some text or add an image');
      return;
    }

    if (content.length > 280) {
      setError(`Text is too long (${content.length}/280 characters)`);
      return;
    }

    // Check if X is connected
    if (!xStatus?.connected) {
      setError('X account not connected. Please connect your X account first.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If there's an image, post with media, otherwise text-only
      // Use new tweepy endpoint for media upload (supports OAuth 1.0a)
      let postResponse;
      if (preloadedImageUrl) {
        postResponse = await authenticatedFetchJson(
          API_ENDPOINTS.X_TWEEPY_POST_WITH_MEDIA,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: content.trim() || '',
              media_urls: [preloadedImageUrl]
            }),
          },
          navigate
        );
      } else {
        postResponse = await authenticatedFetchJson(
          API_ENDPOINTS.X_POST,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: content.trim()
            }),
          },
          navigate
        );
      }

      if (postResponse.success) {
        onClose();
        if (onPostCreated) {
          onPostCreated(postResponse);
        }
      } else {
        throw new Error('Failed to post to X');
      }
    } catch (err) {
      console.error('Error posting to X:', err);
      
      // Check if error is about OAuth 1.0a not being connected
      const errorMessage = err.message || '';
      if (errorMessage.includes('OAuth 1.0a') || errorMessage.includes('media upload')) {
        setError('X account not connected for media upload. Please connect your X account for media posting first.');
      } else {
        setError(errorMessage || 'Failed to post to X. Please try again.');
      }
      
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const remainingChars = 280 - content.length;
  const isOverLimit = content.length > 280;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Post to X</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>What's happening?</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              rows={6}
              maxLength={280}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: isOverLimit ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '4px',
              fontSize: '0.85rem',
              color: isOverLimit ? 'var(--accent-orange)' : 'var(--text-secondary)'
            }}>
              <span>{remainingChars} characters remaining</span>
              {xStatus?.x_username && (
                <span style={{ color: 'var(--text-secondary)' }}>
                  Posting as {xStatus.x_username}
                </span>
              )}
            </div>
          </div>

          {preloadedImageUrl && (
            <div className="form-group">
              <label>Image Preview</label>
              <div style={{
                position: 'relative',
                width: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)'
              }}>
                <img
                  src={preloadedImageUrl}
                  alt="Post preview"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="form-error">
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-post"
              disabled={isSubmitting || isOverLimit || (!content.trim() && !preloadedImageUrl)}
              style={{
                background: isSubmitting || isOverLimit || (!content.trim() && !preloadedImageUrl) 
                  ? 'var(--bg-tertiary)' 
                  : 'var(--accent-green)',
                opacity: isSubmitting || isOverLimit || (!content.trim() && !preloadedImageUrl) ? 0.6 : 1
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Posting to X...
                </>
              ) : (
                '🐦 Post to X'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateXPostModal;

