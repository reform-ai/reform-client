/**
 * Utility to get video duration from a File object
 * @param {File} file - Video file
 * @returns {Promise<number>} Duration in seconds
 */
export function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('video/')) {
      reject(new Error('File is not a video'));
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Utility to get video FPS from a File object
 * Note: FPS is not reliably available from HTML5 video API
 * Returns null - actual FPS comes from server response (calculation_results.fps)
 * @param {File} file - Video file
 * @returns {Promise<number|null>} FPS or null if unavailable
 */
export function getVideoFPS(file) {
  return Promise.resolve(null);
}

