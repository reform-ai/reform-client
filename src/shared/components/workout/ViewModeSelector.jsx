import React from 'react';
import './ViewModeSelector.css';

/**
 * View mode selector component
 * @param {Object} props
 * @param {string} props.viewMode - Current view mode: 'daily' or 'weekly'
 * @param {Function} props.onViewModeChange - Callback when view mode changes
 */
const ViewModeSelector = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="view-mode-selector">
      <label htmlFor="view-mode" className="view-mode-label">View Mode</label>
      <select
        id="view-mode"
        value={viewMode}
        onChange={(e) => onViewModeChange(e.target.value)}
        className="view-mode-dropdown"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
    </div>
  );
};

export default ViewModeSelector;

