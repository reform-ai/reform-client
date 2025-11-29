import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { getUserToken } from '../../utils/authStorage';
import '../../styles/social/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const navigate = useNavigate();
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    if (postType === 'text' && !content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsSubmitting(true);
    const token = getUserToken();

    try {
      const response = await fetch(API_ENDPOINTS.POSTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_type: postType,
          content: content.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Failed to create post';
        throw new Error(errorMessage);
      }

      setContent('');
      setPostType('text');
      onClose(); // Close modal after successful post
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError(err.message || 'Failed to create post');
      setIsSubmitting(false); // Only reset on error, success closes modal
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Post</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>Post Type</label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem'
              }}
            >
              <option value="text">Text Post</option>
            </select>
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              required={postType === 'text'}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {error && (
            <div className="form-error">
              {error.includes('set a username in your profile') ? (
                <p>
                  {error.split('set a username in your profile')[0]}
                  <a
                    href="/profile"
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      navigate('/profile');
                    }}
                    style={{
                      color: 'var(--accent-green)',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    set a username in your profile
                  </a>
                  {error.split('set a username in your profile')[1]}
                </p>
              ) : (
                <p>{error}</p>
              )}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || (postType === 'text' && !content.trim())}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;

