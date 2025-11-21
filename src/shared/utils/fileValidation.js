/**
 * File validation utilities for video uploads
 */

export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
export const WARNING_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Validates a video file
 * @param {File} file - File to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Please select a video file' };
  }

  if (!file.type.startsWith('video/')) {
    return { valid: false, error: 'Please select a valid video file' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxMB = (MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0);
    return {
      valid: false,
      error: `Video file too large (${sizeMB} MB). Maximum file size: ${maxMB} MB.`,
    };
  }

  if (file.size > WARNING_SIZE_BYTES) {
    console.warn(`⚠️ Large file detected (${(file.size / 1024 / 1024).toFixed(2)} MB). Upload may take longer.`);
  }

  return { valid: true };
};

