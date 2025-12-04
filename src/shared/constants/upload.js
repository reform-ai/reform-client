/**
 * Upload-related constants
 * 
 * @deprecated Use constants from '../constants/app' (FILE_SIZES, ALLOWED_FILE_TYPES) instead.
 * This file is kept for backward compatibility.
 */

import { FILE_SIZES, ALLOWED_FILE_TYPES } from './app';

export const UPLOAD_CONSTANTS = {
  /** @deprecated Use FILE_SIZES.MAX_IMAGES instead */
  MAX_IMAGES: FILE_SIZES.MAX_IMAGES,
  /** @deprecated Use FILE_SIZES.MAX_IMAGE_BYTES instead */
  MAX_FILE_SIZE: FILE_SIZES.MAX_IMAGE_BYTES,
  /** @deprecated Use ALLOWED_FILE_TYPES.IMAGES instead */
  ALLOWED_IMAGE_TYPES: ALLOWED_FILE_TYPES.IMAGES,
};

