/**
 * Custom Hook for Image Uploads
 * 
 * Manages image state, file validation, preview generation, and upload logic
 * for post creation and other image upload scenarios.
 * 
 * @module useImageUpload
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { validateImageFiles } from '../utils/imageValidation';
import { UPLOAD_CONSTANTS } from '../constants/upload';

/**
 * Custom hook for image upload functionality.
 * 
 * Handles the complete image upload workflow:
 * - File selection and validation
 * - Preview generation
 * - Server upload with progress tracking
 * - Error handling
 * - Multiple image management
 * 
 * @param {number} [maxImages=UPLOAD_CONSTANTS.MAX_IMAGES] - Maximum number of images allowed (default: 5)
 * @returns {Object} Image upload state and handlers
 * @returns {Array<Object>} returns.images - Array of image objects with structure:
 *   - `id` (string|number) - Unique image identifier
 *   - `file` (File|null) - Original file object
 *   - `preview` (string|null) - Data URL for preview
 *   - `url` (string|null) - Uploaded image URL from server
 *   - `thumbnailUrl` (string|null) - Thumbnail URL from server
 *   - `uploading` (boolean) - Whether image is currently uploading
 *   - `error` (string|null) - Upload error message if any
 * @returns {string} returns.error - Current error message (validation errors)
 * @returns {Function} returns.setImages - Direct state setter for images array
 * @returns {Function} returns.setError - Direct state setter for error message
 * @returns {Function} returns.handleImageSelect - Handler for file input: `(files: FileList|File[]) => Promise<void>`
 * @returns {Function} returns.removeImage - Remove image by ID: `(imageId: string|number) => void`
 * @returns {Function} returns.addPreloadedImage - Add image that's already uploaded: `(imageUrl: string, thumbnailUrl?: string) => void`
 * @returns {Function} returns.resetImages - Clear all images: `() => void`
 * 
 * @example
 * // Basic usage
 * const { images, error, handleImageSelect, removeImage } = useImageUpload();
 * 
 * <input
 *   type="file"
 *   multiple
 *   accept="image/*"
 *   onChange={(e) => handleImageSelect(e.target.files)}
 * />
 * 
 * @example
 * // With custom max images
 * const { images, handleImageSelect } = useImageUpload(3); // Max 3 images
 * 
 * @example
 * // With preloaded image (for editing existing posts)
 * const { addPreloadedImage } = useImageUpload();
 * 
 * useEffect(() => {
 *   if (existingImageUrl) {
 *     addPreloadedImage(existingImageUrl, thumbnailUrl);
 *   }
 * }, [existingImageUrl]);
 */
export function useImageUpload(maxImages = UPLOAD_CONSTANTS.MAX_IMAGES) {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  /**
   * Creates a preview URL for a file using FileReader.
   * 
   * @param {File} file - The file to create preview for
   * @returns {Promise<string>} Data URL for the preview
   * @private
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
   * Uploads a single image file to the server.
   * 
   * Updates the image state with upload progress and result.
   * Sets `uploading: false` and `url`/`thumbnailUrl` on success,
   * or `error` on failure.
   * 
   * @param {File} file - The file to upload
   * @param {string|number} imageId - Unique ID for the image (from images array)
   * @private
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
   * Handles file selection, validation, preview generation, and upload.
   * 
   * This is the main entry point for image selection. It:
   * 1. Validates files (type, size, count)
   * 2. Generates previews for valid files
   * 3. Adds images to state
   * 4. Uploads each image to the server
   * 
   * @param {FileList|File[]} files - Files to upload (from file input)
   * @throws {Error} Sets error state if validation fails
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
   * Removes an image from the list by ID.
   * 
   * Also clears any error state when called.
   * 
   * @param {string|number} imageId - ID of the image to remove
   */
  const removeImage = useCallback((imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setError('');
  }, []);

  /**
   * Adds a preloaded image that's already uploaded (no upload needed).
   * 
   * Useful for editing existing posts or displaying already-uploaded images.
   * The image is added with `uploading: false` and `url`/`thumbnailUrl` already set.
   * 
   * @param {string} imageUrl - URL of the preloaded image
   * @param {string} [thumbnailUrl] - Optional thumbnail URL (defaults to imageUrl)
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
   * Resets all images and clears error state.
   * 
   * Useful for clearing the form or resetting after successful submission.
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

