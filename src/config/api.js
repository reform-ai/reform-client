/**
 * API Configuration - Backward Compatibility Wrapper
 * 
 * This file re-exports from the new domain-based structure.
 * All existing imports continue to work without changes.
 * 
 * The actual endpoints are now organized in src/config/api/ directory:
 * - base.js: Base API URL configuration
 * - core.js: Core endpoints (upload, health, etc.)
 * - auth.js: Authentication endpoints
 * - social.js: Social feed endpoints
 * - tokens.js: Token endpoints
 * - analysis.js: Analysis endpoints
 * - poseService.js: Pose service endpoints
 * - contact.js: Contact endpoints
 * - xIntegration.js: X (Twitter) integration endpoints
 * - workoutPlans.js: Workout plan endpoints
 * - expertCoaching.js: Expert coaching endpoints
 * - index.js: Main export combining all domains
 */

// Re-export from the new structure (maintains exact same import path)
export { API_URL, API_ENDPOINTS } from './api/index.js';

