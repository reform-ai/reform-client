import { API_ENDPOINTS } from '../../config/api';
import { parseErrorResponse, createErrorWithData, getStatusErrorMessage } from './apiErrorHandler';

/**
 * Parses upload-specific error response from XMLHttpRequest.
 * Uses the shared error handler but adds upload-specific status code messages.
 * 
 * @param {XMLHttpRequest} xhr - The XMLHttpRequest object
 * @returns {{errorMsg: string, errorData: object|null}} Parsed error message and structured data
 */
function parseUploadError(xhr) {
  // Use shared error parser
  let { errorMsg, errorData } = parseErrorResponse(xhr, xhr.responseText, xhr.status);
  
  // Override with upload-specific messages for certain status codes
  if (errorMsg === 'An error occurred' || !xhr.responseText) {
    const uploadSpecificMessages = {
      403: 'Analysis limit reached. Anonymous users are limited to 1 analysis. Please sign up for unlimited analyses.',
      402: errorData ? null : 'Insufficient tokens. Please wait for daily token reset or upgrade your account.',
      413: 'File too large. Maximum size is 500MB.',
      415: 'Unsupported file format. Please use MP4, MOV, or AVI.',
    };
    
    if (xhr.status in uploadSpecificMessages && uploadSpecificMessages[xhr.status]) {
      errorMsg = uploadSpecificMessages[xhr.status];
    } else {
      // Fall back to generic status code handler
      const genericMsg = getStatusErrorMessage(xhr.status, errorData);
      if (genericMsg) {
        errorMsg = genericMsg;
      }
    }
  }
  
  return { errorMsg, errorData };
}

/**
 * Handles video upload and analysis
 * @param {Object} params - Upload parameters
 * @param {File} params.file - Video file to upload
 * @param {string} params.exercise - Exercise type ID
 * @param {string|null} params.notes - Optional notes
 * @param {Function} params.onProgress - Progress callback (progress, text)
 * @returns {Promise<Object>} Analysis result
 */
export const uploadVideo = async ({ file, exercise, notes = null, onProgress }) => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('exercise', exercise);
  if (notes && notes.trim()) {
    formData.append('notes', notes.trim());
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress?.(percentComplete, `Uploading... ${Math.round(percentComplete)}%`);
        if (percentComplete >= 99.9) {
          onProgress?.(100, 'Upload complete, analyzing...');
        }
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        // Handle error responses from the server
        const { errorMsg, errorData } = parseUploadError(xhr);
        
        // Create error object with structured data attached
        // errorData contains info like needs_activation flag for UI customization
        const error = createErrorWithData(errorMsg, errorData);
        reject(error);
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    xhr.open('POST', API_ENDPOINTS.UPLOAD_VIDEO);
    const token = localStorage.getItem('userToken');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  });
};

