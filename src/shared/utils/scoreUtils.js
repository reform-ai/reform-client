/**
 * Score Utility Functions
 * 
 * Provides utilities for working with form scores and determining
 * appropriate colors based on score ranges.
 * 
 * @module scoreUtils
 */

import { SCORE_THRESHOLDS } from '../constants/app';

/**
 * Gets the appropriate CSS color variable based on score value.
 * 
 * Score ranges:
 * - 90-100: Excellent (green)
 * - 75-89: Good (amber)
 * - 60-74: Warning (orange)
 * - 0-59: Poor (red)
 * 
 * @param {number} score - Score value (0-100)
 * @returns {string} CSS variable name for score color
 *   - 'var(--score-excellent)' for 90-100
 *   - 'var(--score-good)' for 75-89
 *   - 'var(--score-warning)' for 60-74
 *   - 'var(--score-poor)' for 0-59
 * 
 * @example
 * const color = getScoreColor(85); // Returns 'var(--score-good)'
 * <div style={{ color: getScoreColor(score) }}>Score: {score}</div>
 */
export const getScoreColor = (score) => {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'var(--score-excellent)';
  if (score >= SCORE_THRESHOLDS.GOOD) return 'var(--score-good)';
  if (score >= SCORE_THRESHOLDS.WARNING) return 'var(--score-warning)';
  return 'var(--score-poor)';
};

