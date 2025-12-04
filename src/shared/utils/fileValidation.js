/**
 * File Validation Utilities
 * 
 * Provides validation functions for video file uploads, including
 * file type and size checks.
 * 
 * @module fileValidation
 */

import { FILE_SIZES } from '../constants/app';

/**
 * Maximum allowed file size in bytes (500 MB)
 * @constant {number}
 * @deprecated Use FILE_SIZES.MAX_VIDEO_BYTES instead
 */
export const MAX_FILE_SIZE_BYTES = FILE_SIZES.MAX_VIDEO_BYTES;

/**
 * File size threshold for warnings (50 MB).
 * Files larger than this will log a warning but are still allowed.
 * @constant {number}
 * @deprecated Use FILE_SIZES.VIDEO_WARNING_BYTES instead
 */
export const WARNING_SIZE_BYTES = FILE_SIZES.VIDEO_WARNING_BYTES;

/**
 * Validates a video file before upload.
 * 
 * Checks:
 * - File exists
 * - File is a video type
 * - File size is within limits (500 MB max)
 * 
 * @param {File} file - File object to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 *   - valid: true if file is valid, false otherwise
 *   - error: Error message if validation fails
 * 
 * @example
 * const result = validateFile(file);
 * if (!result.valid) {
 *   setError(result.error);
 *   return;
 * }
 */
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Please select a video file' };
  }

  if (!file.type.startsWith('video/')) {
    return { valid: false, error: 'Please select a valid video file' };
  }

  if (file.size > FILE_SIZES.MAX_VIDEO_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxMB = (FILE_SIZES.MAX_VIDEO_BYTES / 1024 / 1024).toFixed(0);
    return {
      valid: false,
      error: `Video file too large (${sizeMB} MB). Maximum file size: ${maxMB} MB.`,
    };
  }

  if (file.size > FILE_SIZES.VIDEO_WARNING_BYTES) {
    console.warn(`⚠️ Large file detected (${(file.size / 1024 / 1024).toFixed(2)} MB). Upload may take longer.`);
  }

  return { valid: true };
};

