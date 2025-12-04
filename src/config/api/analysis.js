/**
 * Analysis API endpoints
 */

import { API_URL } from './base';

export const analysisEndpoints = {
  ANALYSES: `${API_URL}/api/analyses`,
  ANALYSIS: (analysisId) => `${API_URL}/api/analyses/${analysisId}`,
  ANALYSIS_PROGRESS: `${API_URL}/api/analyses/progress/metrics`,
  ANALYSIS_GENERATE_SHARE_IMAGE: (analysisId) => `${API_URL}/api/analyses/${analysisId}/generate-share-image`,
};

