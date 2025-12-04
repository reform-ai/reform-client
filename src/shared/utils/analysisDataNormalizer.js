/**
 * Analysis Data Normalizer
 * 
 * Normalizes analysis results data structure to ensure consistent format
 * between immediate analysis responses and saved analysis history.
 * 
 * This ensures that:
 * - fps is always taken from calculation_results.fps (preserves original precision)
 * - Data structure is consistent across all views
 * - Plots and scores use exactly the same data source
 * 
 * @module analysisDataNormalizer
 */

/**
 * Normalizes analysis results to a consistent format.
 * 
 * Ensures consistent data structure between immediate analysis responses
 * and saved analysis history. Handles differences in field names and structure.
 * 
 * @param {Object} analysisData - Analysis data from API (immediate or history)
 * @param {number} analysisData.exercise - Exercise type ID
 * @param {string} [analysisData.exercise_name] - Exercise name
 * @param {number} [analysisData.frame_count] - Number of frames
 * @param {number} [analysisData.fps] - Frames per second
 * @param {Object} [analysisData.calculation_results] - Calculation results with fps
 * @param {Object} [analysisData.form_analysis] - Form analysis data
 * @param {Array} [analysisData.phases] - Exercise phases (history format)
 * @param {Array} [analysisData.squat_phases] - Exercise phases (immediate format)
 * 
 * @returns {Object|null} Normalized analysis results object, or null if input is invalid
 * 
 * @example
 * import { normalizeAnalysisResults } from '../shared/utils/analysisDataNormalizer';
 * 
 * const normalized = normalizeAnalysisResults(analysisData);
 * // Now has consistent structure regardless of source
 */
export const normalizeAnalysisResults = (analysisData) => {
  if (!analysisData) return null;

  // Extract fps from calculation_results first (preserves original precision)
  // This is the fps value that was actually used during analysis
  const fps = analysisData.calculation_results?.fps || analysisData.fps || null;

  // Ensure fps is in calculation_results for consistency
  const calculationResults = {
    ...analysisData.calculation_results,
    fps: fps  // Always use the fps from calculation_results or the top-level fps
  };

  // Normalize phases - handle both 'squat_phases' (immediate) and 'phases' (history)
  const phases = analysisData.phases || analysisData.squat_phases || null;

  return {
    // Core analysis data
    exercise: analysisData.exercise,
    exercise_name: analysisData.exercise_name,
    frame_count: analysisData.frame_count,
    fps: fps,  // Top-level fps for backward compatibility
    
    // Analysis results - always use calculation_results with fps included
    calculation_results: calculationResults,
    
    // Form analysis
    form_analysis: analysisData.form_analysis,
    
    // Phases (normalized to 'phases' for consistency)
    phases: phases,
    squat_phases: phases,  // Keep for backward compatibility
    
    // Camera angle info
    camera_angle_info: analysisData.camera_angle_info,
    
    // Metadata
    id: analysisData.id,
    user_id: analysisData.user_id,
    score: analysisData.score,
    filename: analysisData.filename,
    file_size: analysisData.file_size,
    created_at: analysisData.created_at,
    updated_at: analysisData.updated_at,
    
    // Optional fields
    visualization_url: analysisData.visualization_url,
    visualization_filename: analysisData.visualization_filename,
    session_id: analysisData.session_id,  // For on-demand visualization
    notes: analysisData.notes
  };
};

/**
 * Gets FPS value for use in plots and components.
 * 
 * Always prioritizes calculation_results.fps (the original fps used during analysis)
 * to preserve precision. Falls back to top-level fps if calculation_results.fps is not available.
 * 
 * @param {Object} analysisData - Analysis data (normalized or raw)
 * @param {Object} [analysisData.calculation_results] - Calculation results with fps
 * @param {number} [analysisData.calculation_results.fps] - FPS from calculation results (preferred)
 * @param {number} [analysisData.fps] - Top-level FPS (fallback)
 * 
 * @returns {number|null} FPS value or null if not available
 * 
 * @example
 * import { getFpsFromAnalysis } from '../shared/utils/analysisDataNormalizer';
 * 
 * const fps = getFpsFromAnalysis(analysisData);
 * // Use fps for plot calculations
 */
export const getFpsFromAnalysis = (analysisData) => {
  if (!analysisData) return null;
  
  // Always use fps from calculation_results first (preserves original precision)
  return analysisData.calculation_results?.fps || analysisData.fps || null;
};

/**
 * Gets component scores from form_analysis.
 * 
 * Handles both immediate analysis response format (component_scores) and
 * history response format (final_score.component_scores) for consistency.
 * 
 * @param {Object} formAnalysis - Form analysis object
 * @param {Object} [formAnalysis.component_scores] - Component scores (immediate format)
 * @param {Object} [formAnalysis.final_score] - Final score object (history format)
 * @param {Object} [formAnalysis.final_score.component_scores] - Component scores (history format)
 * 
 * @returns {Object} Component scores object with keys like:
 *   - torso_angle, quad_angle, asymmetry, rep_consistency, movement, etc.
 * 
 * @example
 * import { getComponentScores } from '../shared/utils/analysisDataNormalizer';
 * 
 * const scores = getComponentScores(formAnalysis);
 * // scores = { torso_angle: 85, quad_angle: 90, ... }
 */
export const getComponentScores = (formAnalysis) => {
  if (!formAnalysis) return {};
  
  // Handle both formats: immediate (component_scores) and history (final_score.component_scores)
  if (formAnalysis.component_scores) {
    return formAnalysis.component_scores;
  }
  
  if (formAnalysis.final_score?.component_scores) {
    return formAnalysis.final_score.component_scores;
  }
  
  return {};
};

