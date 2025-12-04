/**
 * Analysis API Utilities
 * 
 * Provides reusable functions for fetching analysis history and progress data.
 * All functions require user authentication.
 * 
 * @module analysisApi
 */

import { API_ENDPOINTS } from '../../config/api';
import { authenticatedFetchJson } from './authenticatedFetch';
import { PAGINATION } from '../constants/app';

/**
 * Get list of analyses with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of analyses to return (default: PAGINATION.DEFAULT_LIMIT)
 * @param {number} params.offset - Number of analyses to skip (default: PAGINATION.DEFAULT_OFFSET)
 * @param {number} params.exercise - Filter by exercise type (1=Squat, 2=Bench, 3=Deadlift)
 * @param {number} params.minScore - Minimum score filter (0-100)
 * @param {number} params.maxScore - Maximum score filter (0-100)
 * @param {string} params.startDate - Start date filter (YYYY-MM-DD)
 * @param {string} params.endDate - End date filter (YYYY-MM-DD)
 * @returns {Promise<Object>} Analysis list response with pagination
 * @throws {Error} If request fails
 */
export async function getAnalyses({
  limit = PAGINATION.DEFAULT_LIMIT,
  offset = PAGINATION.DEFAULT_OFFSET,
  exercise = null,
  minScore = null,
  maxScore = null,
  startDate = null,
  endDate = null
} = {}) {
  // Build query string
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  if (exercise !== null) params.append('exercise', exercise.toString());
  if (minScore !== null) params.append('min_score', minScore.toString());
  if (maxScore !== null) params.append('max_score', maxScore.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  // Use authenticatedFetch for proper token handling and refresh
  return await authenticatedFetchJson(`${API_ENDPOINTS.ANALYSES}?${params.toString()}`, {
    method: 'GET',
  });
}

/**
 * Get single analysis details by ID
 * @param {string} analysisId - Analysis ID
 * @param {Function} navigate - Optional navigate function for redirects on auth failure
 * @returns {Promise<Object>} Full analysis details
 * @throws {Error} If request fails or analysis not found
 */
export async function getAnalysis(analysisId, navigate = null) {
  // Use authenticatedFetch for proper token handling and refresh
  return await authenticatedFetchJson(API_ENDPOINTS.ANALYSIS(analysisId), {
    method: 'GET',
  }, navigate);
}

/**
 * Get progress metrics and trends
 * @param {Function} navigate - Optional navigate function for redirects on auth failure
 * @returns {Promise<Object>} Progress metrics including statistics and trends
 * @throws {Error} If request fails
 */
export async function getProgressMetrics(navigate = null) {
  // Use authenticatedFetch for proper token handling and refresh
  return await authenticatedFetchJson(API_ENDPOINTS.ANALYSIS_PROGRESS, {
    method: 'GET',
  }, navigate);
}

