// Video metadata utility - single source of truth for fps, totalFrames, and duration

import { VIDEO_DEFAULTS } from '../constants/app';

export const getVideoMetadata = ({
  calculationResults = null,
  formAnalysis = null,
  squatPhases = null,
  frameCount = null,
  fpsOverride = null,
  dataArray = null
} = {}) => {
  // FPS priority: fpsOverride > calculationResults > formAnalysis > squatPhases > default
  const derivedFps = calculationResults?.fps || formAnalysis?.fps || squatPhases?.fps;
  const fps = (fpsOverride && fpsOverride > 0 ? fpsOverride : derivedFps) || VIDEO_DEFAULTS.DEFAULT_FPS;

  // Frame count priority: frameCount > calculationResults.frame_count > dataArray length
  let totalFrames = 0;
  if (frameCount != null && Number.isInteger(frameCount) && frameCount > 0) {
    totalFrames = frameCount;
  } else if (calculationResults?.frame_count != null) {
    const fc = calculationResults.frame_count;
    if (Number.isInteger(fc) && fc > 0) totalFrames = fc;
  } else if (dataArray) {
    if (Array.isArray(dataArray) && dataArray.length > 0) {
      totalFrames = dataArray.length;
    } else if (dataArray.torso_angle && Array.isArray(dataArray.torso_angle) && dataArray.torso_angle.length > 0) {
      totalFrames = dataArray.torso_angle.length;
    }
  }

  return {
    fps,
    totalFrames,
    duration: totalFrames > 0 && fps > 0 ? totalFrames / fps : 0
  };
};

