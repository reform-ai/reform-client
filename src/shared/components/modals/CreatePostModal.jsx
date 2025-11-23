import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { getUserToken } from '../../utils/authStorage';
import '../../styles/social/CreatePostModal.css';

const MAX_IMAGES = 5;

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const navigate = useNavigate();
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // Array of { preview, url, uploading, error }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed max
    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images. Please remove some images first.`);
      return;
    }

    // Validate all files
    const validFiles = [];
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not a valid image file`);
        continue;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(`${file.name} is too large (max 10MB)`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setError('');
    const token = getUserToken();

    // Create preview entries first
    const newImages = validFiles.map(file => {
      const reader = new FileReader();
      const previewPromise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      return {
        id: Date.now() + Math.random(),
        file,
        preview: null,
        url: null,
        uploading: true,
        error: null
      };
    });

    // Set previews immediately
    const imagesWithPreviews = await Promise.all(
      newImages.map(async (img, idx) => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onloadend = () => {
            resolve({ ...img, preview: reader.result });
          };
          reader.readAsDataURL(img.file);
        });
      })
    );

    setImages(prev => [...prev, ...imagesWithPreviews]);

    // Upload each image
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const imageId = imagesWithPreviews[i].id;

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
        
        // Update the image with URL and thumbnail URL, remove uploading state
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, url: data.image_url, thumbnailUrl: data.thumbnail_url || data.image_url, uploading: false, error: null }
            : img
        ));
      } catch (err) {
        // Mark this image as having an error
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, uploading: false, error: err.message || 'Failed to upload' }
            : img
        ));
        setError(err.message || 'Failed to upload image');
      }
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setError('');
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
          image_urls: images.length > 0 ? images.filter(img => img.url).map(img => img.url) : null,
          thumbnail_urls: images.length > 0 ? images.filter(img => img.url).map(img => img.thumbnailUrl || img.url) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Failed to create post';
        throw new Error(errorMessage);
      }

      setContent('');
      setPostType('text');
      setImages([]);
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
              Images (Optional) {images.length > 0 && `(${images.length}/${MAX_IMAGES})`}
            </label>
            {images.length < MAX_IMAGES && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
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
                  {images.some(img => img.uploading) ? 'Uploading...' : `+ Add Photo${images.length > 0 ? 's' : ''} (${MAX_IMAGES - images.length} remaining)`}
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
                      onClick={() => handleRemoveImage(image.id)}
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

