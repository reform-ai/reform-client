/**
 * Pose service API endpoints (for on-demand visualization)
 */

const getPoseServiceUrl = () => {
  return import.meta.env.VITE_POSE_SERVICE_URL || 'http://127.0.0.1:8001';
};

export const poseServiceEndpoints = {
  POSE_SERVICE_URL: getPoseServiceUrl(),
  POSE_CREATE_VISUALIZATION: (sessionId) => {
    const poseUrl = getPoseServiceUrl();
    return `${poseUrl}/create-visualization/${sessionId}`;
  },
  POSE_CLEANUP_SESSION: (sessionId) => {
    const poseUrl = getPoseServiceUrl();
    return `${poseUrl}/session/${sessionId}`;
  },
};

