import { API_ENDPOINTS } from '../../config/api';

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
        let errorMsg = 'Network error during upload';
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          if (errorResponse.detail) {
            if (typeof errorResponse.detail === 'string') {
              errorMsg = errorResponse.detail;
            } else if (errorResponse.detail.message) {
              errorMsg = errorResponse.detail.message;
            } else {
              errorMsg = 'Upload failed';
            }
          }
        } catch (e) {
          // Handle status codes
          if (xhr.status === 403) {
            errorMsg = 'Analysis limit reached. Anonymous users are limited to 1 analysis. Please sign up for unlimited analyses.';
          } else if (xhr.status === 402) {
            errorMsg = 'Insufficient tokens. Please wait for daily token reset or upgrade your account.';
          } else if (xhr.status === 413) {
            errorMsg = 'File too large. Maximum size is 500MB.';
          } else if (xhr.status === 415) {
            errorMsg = 'Unsupported file format. Please use MP4, MOV, or AVI.';
          } else if (xhr.status >= 500) {
            errorMsg = 'Server error. Please try again later.';
          }
        }
        reject(new Error(errorMsg));
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

