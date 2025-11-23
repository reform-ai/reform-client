import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { authenticatedFetchJson } from '../../utils/authenticatedFetch';
import { useImageUpload } from '../../hooks/useImageUpload';
import { UPLOAD_CONSTANTS } from '../../constants/upload';
import '../../styles/social/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, preloadedImageUrl, preloadedThumbnailUrl, prefilledCaption }) => {
  const navigate = useNavigate();
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Use custom hook for image upload functionality
  const {
    images,
    error,
    setError,
    handleImageSelect,
    removeImage,
    addPreloadedImage,
    resetImages,
  } = useImageUpload(UPLOAD_CONSTANTS.MAX_IMAGES);

  // Handle modal open/close and preloaded data
  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes
      resetImages();
      setContent('');
      setPostType('text');
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Handle preloaded image when modal opens
    if (preloadedImageUrl) {
      addPreloadedImage(preloadedImageUrl, preloadedThumbnailUrl);
    } else {
      resetImages();
    }

    // Handle prefilled caption when modal opens
    if (prefilledCaption) {
      setContent(prefilledCaption);
    } else if (!preloadedImageUrl) {
      // Only reset content if there's no preloaded image
      setContent('');
    }
  }, [isOpen, preloadedImageUrl, preloadedThumbnailUrl, prefilledCaption, addPreloadedImage, resetImages]);

  // Handle case where preloadedImageUrl becomes available after modal opens
  useEffect(() => {
    if (isOpen && preloadedImageUrl && images.length === 0) {
      addPreloadedImage(preloadedImageUrl, preloadedThumbnailUrl);
    }
  }, [isOpen, preloadedImageUrl, preloadedThumbnailUrl, images.length, addPreloadedImage]);

  // Handle case where prefilledCaption becomes available after modal opens
  useEffect(() => {
    if (isOpen && prefilledCaption && !content) {
      setContent(prefilledCaption);
    }
  }, [isOpen, prefilledCaption, content]);

  const handleFileInputChange = (e) => {
    handleImageSelect(e.target.files);
    // Clear file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prevent double submission
    if (isSubmitting || images.some(img => img.uploading)) {
      return;
    }

    // Check if any images are still uploading
    const hasUploadingImages = images.some(img => img.uploading);
    if (hasUploadingImages) {
      setError('Please wait for all images to finish uploading');
      return;
    }

    // Check if any images have errors
    const hasImageErrors = images.some(img => img.error);
    if (hasImageErrors) {
      setError('Please fix or remove images with errors before posting');
      return;
    }

    if (postType === 'text' && !content.trim() && images.length === 0) {
      setError('Please enter some content or add an image');
      return;
    }

    setIsSubmitting(true);

    try {
      await authenticatedFetchJson(
        API_ENDPOINTS.POSTS,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post_type: postType,
            content: content.trim() || null,
            image_urls: images.length > 0 ? images.filter(img => img.url).map(img => img.url) : null,
            thumbnail_urls: images.length > 0 ? images.filter(img => img.url).map(img => img.thumbnailUrl || img.url) : null,
          }),
        },
        navigate
      );

      onClose(); // Close modal after successful post (reset happens in useEffect)
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
              required={postType === 'text' && images.length === 0}
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
            <label>
              Images (Optional) {images.length > 0 && `(${images.length}/${UPLOAD_CONSTANTS.MAX_IMAGES})`}
            </label>
            {images.length < UPLOAD_CONSTANTS.MAX_IMAGES && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  disabled={isSubmitting || images.some(img => img.uploading)}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting || images.some(img => img.uploading)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.9rem',
                    opacity: (isSubmitting || images.some(img => img.uploading)) ? 0.5 : 1,
                    cursor: (isSubmitting || images.some(img => img.uploading)) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {images.some(img => img.uploading) ? 'Uploading...' : `+ Add Photo${images.length > 0 ? 's' : ''} (${UPLOAD_CONSTANTS.MAX_IMAGES - images.length} remaining)`}
                </button>
              </div>
            )}
            {images.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '12px',
                marginTop: '12px'
              }}>
                {images.map((image) => (
                  <div key={image.id} style={{ position: 'relative' }}>
                    <img
                      src={image.preview || image.url}
                      alt="Preview"
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: image.error ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                        opacity: image.uploading ? 0.6 : 1
                      }}
                    />
                    {image.uploading && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}>
                        Uploading...
                      </div>
                    )}
                    {image.error && (
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        padding: '4px',
                        fontSize: '0.7rem',
                        textAlign: 'center',
                        borderRadius: '0 0 8px 8px'
                      }}>
                        {image.error}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      disabled={isSubmitting || image.uploading}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: (isSubmitting || image.uploading) ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: (isSubmitting || image.uploading) ? 0.5 : 1
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
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
              disabled={isSubmitting || images.some(img => img.uploading)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-post"
              disabled={isSubmitting || images.some(img => img.uploading) || (postType === 'text' && !content.trim() && images.length === 0)}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Posting...
                </>
              ) : images.some(img => img.uploading) ? (
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

