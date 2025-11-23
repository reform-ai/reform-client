/**
 * Custom hook for handling image uploads
 * 
 * Manages image state, file validation, preview generation, and upload logic
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { validateImageFiles } from '../utils/imageValidation';
import { UPLOAD_CONSTANTS } from '../constants/upload';

/**
 * Custom hook for image upload functionality
 * @param {number} maxImages - Maximum number of images allowed (default: UPLOAD_CONSTANTS.MAX_IMAGES)
 * @returns {Object} Image upload state and handlers
 */
export function useImageUpload(maxImages = UPLOAD_CONSTANTS.MAX_IMAGES) {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  /**
   * Creates a preview URL for a file
   * @param {File} file - The file to create preview for
   * @returns {Promise<string>} Data URL for the preview
   */
  const createPreview = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Uploads a single image file
   * @param {File} file - The file to upload
   * @param {string} imageId - Unique ID for the image
   */
  const uploadImage = useCallback(async (file, imageId) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await authenticatedFetch(
        API_ENDPOINTS.POST_IMAGE_UPLOAD,
        {
          method: 'POST',
          body: formData,
        },
        navigate
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      // Update the image with URL and thumbnail URL, remove uploading state
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? {
              ...img,
              url: data.image_url,
              thumbnailUrl: data.thumbnail_url || data.image_url,
              uploading: false,
              error: null
            }
          : img
      ));
    } catch (err) {
      // Mark this image as having an error
      const errorMessage = err.message || 'Failed to upload image';
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, uploading: false, error: errorMessage }
          : img
      ));
      setError(errorMessage);
    }
  }, [navigate]);

  /**
   * Handles file selection and upload
   * @param {FileList|File[]} files - Files to upload
   */
  const handleImageSelect = useCallback(async (files) => {
    const fileArray = Array.from(files || []);
    if (fileArray.length === 0) return;

    // Validate files
    const { validFiles, errors } = validateImageFiles(fileArray, images.length);

    // Show first error if any
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    if (validFiles.length === 0) return;

    setError('');

    // Create preview entries first
    const newImages = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: null,
      url: null,
      uploading: true,
      error: null
    }));

    // Generate previews
    const imagesWithPreviews = await Promise.all(
      newImages.map(async (img) => {
        const preview = await createPreview(img.file);
        return { ...img, preview };
      })
    );

    // Add images to state
    setImages(prev => [...prev, ...imagesWithPreviews]);

    // Upload each image
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const imageId = imagesWithPreviews[i].id;
      await uploadImage(file, imageId);
    }
  }, [images.length, createPreview, uploadImage]);

  /**
   * Removes an image from the list
   * @param {string} imageId - ID of the image to remove
   */
  const removeImage = useCallback((imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setError('');
  }, []);

  /**
   * Adds a preloaded image (already has URL, no upload needed)
   * @param {string} imageUrl - URL of the preloaded image
   * @param {string} thumbnailUrl - Optional thumbnail URL
   */
  const addPreloadedImage = useCallback((imageUrl, thumbnailUrl = null) => {
    const preloadedImage = {
      id: 'preloaded-' + Date.now(),
      file: null,
      preview: imageUrl,
      url: imageUrl,
      thumbnailUrl: thumbnailUrl || imageUrl,
      uploading: false,
      error: null
    };
    setImages([preloadedImage]);
  }, []);

  /**
   * Resets all images
   */
  const resetImages = useCallback(() => {
    setImages([]);
    setError('');
  }, []);

  return {
    images,
    error,
    setImages,
    setError,
    handleImageSelect,
    removeImage,
    addPreloadedImage,
    resetImages,
  };
}

