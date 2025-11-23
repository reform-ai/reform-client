/**
 * Image file validation utilities
 */

import { UPLOAD_CONSTANTS } from '../constants/upload';

/**
 * Validates a single image file
 * @param {File} file - The file to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export function validateImageFile(file) {
  // Check if it's a valid File object
  if (!(file instanceof File)) {
    return { valid: false, error: `${file.name || 'File'} is not a valid file` };
  }

  // Validate file type
  if (!file.type || !file.type.startsWith('image/')) {
    return { valid: false, error: `${file.name} is not a valid image file` };
  }

  // Validate file size
  if (file.size > UPLOAD_CONSTANTS.MAX_FILE_SIZE) {
    const maxSizeMB = UPLOAD_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024);
    return { valid: false, error: `${file.name} is too large (max ${maxSizeMB}MB)` };
  }

  return { valid: true };
}

/**
 * Validates multiple image files and checks count limits
 * @param {File[]} files - Array of files to validate
 * @param {number} existingCount - Number of images already added
 * @returns {{ validFiles: File[], errors: string[] }} Validation results
 */
export function validateImageFiles(files, existingCount = 0) {
  const validFiles = [];
  const errors = [];

  for (const file of files) {
    const validation = validateImageFile(file);
    if (validation.valid) {
      validFiles.push(file);
    } else if (validation.error) {
      errors.push(validation.error);
    }
  }

  // Check if adding these files would exceed max
  if (existingCount + validFiles.length > UPLOAD_CONSTANTS.MAX_IMAGES) {
    errors.push(`You can only upload up to ${UPLOAD_CONSTANTS.MAX_IMAGES} images. Please remove some images first.`);
  }

  return { validFiles, errors };
}

