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
 */

/**
 * Normalizes analysis results to a consistent format
 * @param {Object} analysisData - Analysis data from API (immediate or history)
 * @returns {Object} Normalized analysis results object
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
 * Gets fps value for use in plots and components
 * Always prioritizes calculation_results.fps (the original fps used during analysis)
 * @param {Object} analysisData - Analysis data (normalized or raw)
 * @returns {number|null} FPS value or null if not available
 */
export const getFpsFromAnalysis = (analysisData) => {
  if (!analysisData) return null;
  
  // Always use fps from calculation_results first (preserves original precision)
  return analysisData.calculation_results?.fps || analysisData.fps || null;
};

/**
 * Gets component scores from form_analysis
 * Handles both immediate and history response formats
 * @param {Object} formAnalysis - Form analysis object
 * @returns {Object} Component scores object
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

