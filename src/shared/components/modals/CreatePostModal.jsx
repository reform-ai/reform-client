import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { getUserToken } from '../../utils/authStorage';
import '../../styles/social/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const navigate = useNavigate();
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Image size must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image
    setIsUploadingImage(true);
    setError('');
    const token = getUserToken();

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(API_ENDPOINTS.POST_IMAGE_UPLOAD, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Failed to upload image';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setImageUrl(data.image_url);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prevent double submission
    if (isSubmitting || isUploadingImage) {
      return;
    }

    if (postType === 'text' && !content.trim() && !imageUrl) {
      setError('Please enter some content or add an image');
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
          image_urls: imageUrl ? [imageUrl] : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Failed to create post';
        throw new Error(errorMessage);
      }

      setContent('');
      setPostType('text');
      setImageUrl(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
              required={postType === 'text' && !imageUrl}
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

          <div className="form-group">
            <label>Image (Optional)</label>
            {!imagePreview && !imageUrl && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isUploadingImage || isSubmitting}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage || isSubmitting}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.9rem',
                    opacity: (isUploadingImage || isSubmitting) ? 0.5 : 1,
                    cursor: (isUploadingImage || isSubmitting) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUploadingImage ? 'Uploading...' : '+ Add Photo'}
                </button>
              </div>
            )}
            {(imagePreview || imageUrl) && (
              <div style={{ position: 'relative', marginTop: '12px' }}>
                <img
                  src={imagePreview || imageUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                >
                  ×
                </button>
              </div>
            )}
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
              className="btn-cancel"
              disabled={isSubmitting || isUploadingImage}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-post"
              disabled={isSubmitting || isUploadingImage || (postType === 'text' && !content.trim() && !imageUrl)}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Posting...
                </>
              ) : isUploadingImage ? (
                <>
                  <span className="btn-spinner"></span>
                  Uploading...
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;

