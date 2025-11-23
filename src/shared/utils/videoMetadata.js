// Video metadata utility functions
// Centralized functions to extract fps, totalFrames, and duration from various data sources

/**
 * Extracts video metadata (fps, totalFrames, duration) from various data sources
 * @param {Object} options - Data sources
 * @param {Object} options.calculationResults - Calculation results object
 * @param {Object} options.formAnalysis - Form analysis object
 * @param {Object} options.squatPhases - Squat phases object
 * @param {number} options.frameCount - Explicit frame count
 * @param {number} options.fpsOverride - Explicit fps override
 * @param {Array} options.dataArray - Data array to calculate frames from (fallback)
 * @returns {Object} Object with fps, totalFrames, and duration
 */
export const getVideoMetadata = ({
  calculationResults = null,
  formAnalysis = null,
  squatPhases = null,
  frameCount = null,
  fpsOverride = null,
  dataArray = null
} = {}) => {
  // Extract fps from various sources (priority: fpsOverride > calculationResults > formAnalysis > squatPhases > default)
  const derivedFps = calculationResults?.fps || formAnalysis?.fps || squatPhases?.fps;
  const fps = (fpsOverride && fpsOverride > 0 ? fpsOverride : derivedFps) || 30;

  // Extract totalFrames from various sources (priority: frameCount > calculationResults > dataArray length)
  let totalFrames = frameCount;
  if (!totalFrames && calculationResults) {
    totalFrames = calculationResults.frame_count;
  }
  if (!totalFrames && dataArray) {
    if (Array.isArray(dataArray)) {
      totalFrames = dataArray.length;
    } else if (dataArray.torso_angle && Array.isArray(dataArray.torso_angle)) {
      totalFrames = dataArray.torso_angle.length;
    }
  }

  // Calculate duration in seconds
  const duration = totalFrames && fps > 0 ? totalFrames / fps : 0;

  return {
    fps,
    totalFrames: totalFrames || 0,
    duration
  };
};

