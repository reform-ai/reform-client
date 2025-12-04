/**
 * API Configuration - Main Export
 * 
 * Combines all domain-specific endpoints into a single API_ENDPOINTS object.
 * This maintains backward compatibility with existing imports.
 * 
 * Import usage (unchanged):
 *   import { API_ENDPOINTS, API_URL } from '../config/api';
 */

import { API_URL } from './base';
import { coreEndpoints } from './core';
import { authEndpoints } from './auth';
import { socialEndpoints } from './social';
import { tokenEndpoints } from './tokens';
import { analysisEndpoints } from './analysis';
import { poseServiceEndpoints } from './poseService';
import { contactEndpoints } from './contact';
import { xIntegrationEndpoints } from './xIntegration';
import { workoutPlanEndpoints } from './workoutPlans';
import { expertCoachingEndpoints } from './expertCoaching';

// Export API_URL for direct access
export { API_URL };

// Combine all endpoints into a single object (maintains backward compatibility)
export const API_ENDPOINTS = {
  ...coreEndpoints,
  ...authEndpoints,
  ...socialEndpoints,
  ...tokenEndpoints,
  ...analysisEndpoints,
  ...poseServiceEndpoints,
  ...contactEndpoints,
  ...xIntegrationEndpoints,
  ...workoutPlanEndpoints,
  ...expertCoachingEndpoints,
};

// Only log API URL in development mode for security
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL);
  console.log('🔗 Upload endpoint:', API_ENDPOINTS.UPLOAD_VIDEO);
}

