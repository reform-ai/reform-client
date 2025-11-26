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
    let objectUrl = null;

    const cleanup = () => {
      if (objectUrl) {
        try {
          window.URL.revokeObjectURL(objectUrl);
        } catch (e) {
          console.warn('Error revoking object URL:', e);
        }
        objectUrl = null;
      }
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      resolve(duration);
    };

    video.onerror = (e) => {
      console.error('Video metadata load error:', e);
      cleanup();
      reject(new Error('Failed to load video metadata'));
    };

    try {
      objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
    } catch (e) {
      console.error('Error creating object URL:', e);
      reject(new Error('Failed to create object URL for video'));
    }
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

