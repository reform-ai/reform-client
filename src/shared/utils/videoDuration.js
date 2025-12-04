/**
 * Video Duration Utilities
 * 
 * Provides utilities for extracting metadata from video files,
 * including duration and FPS information.
 * 
 * @module videoDuration
 */

/**
 * Gets the duration of a video file in seconds.
 * 
 * Creates a temporary video element to load metadata and extract duration.
 * Automatically cleans up resources after extraction.
 * 
 * @param {File} file - Video file object
 * @returns {Promise<number>} Duration in seconds
 * @throws {Error} If file is not a video or metadata cannot be loaded
 * 
 * @example
 * try {
 *   const duration = await getVideoDuration(file);
 *   console.log(`Video is ${duration} seconds long`);
 * } catch (error) {
 *   console.error('Failed to get duration:', error);
 * }
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
 * Gets the FPS (frames per second) of a video file.
 * 
 * Note: FPS is not reliably available from the HTML5 video API.
 * This function always returns null. Actual FPS is determined by the server
 * during analysis and is available in `calculation_results.fps`.
 * 
 * @param {File} file - Video file object
 * @returns {Promise<null>} Always returns null (FPS not available client-side)
 * 
 * @see {@link analysisDataNormalizer.getFpsFromAnalysis} for getting FPS from analysis results
 */
export function getVideoFPS(file) {
  return Promise.resolve(null);
}

