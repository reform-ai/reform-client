import React from 'react';
import '../../styles/upload/ExerciseSelector.css';

/**
 * ExerciseSelector - Exercise type dropdown
 * 
 * Props:
 * - value: string - Selected exercise value
 * - onChange: (value: string) => void - Callback when selection changes
 * - disabled: boolean - Whether selector is disabled
 */
const ExerciseSelector = ({ value, onChange, disabled = false }) => {
  return (
    <div className="select-group">
      <label htmlFor="exercise">Exercise Type</label>
      <select
        id="exercise"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">-- Select Exercise --</option>
        <option value="1">Squat</option>
        <option value="2" disabled>Bench (Coming Soon)</option>
        <option value="3" disabled>Deadlift (Coming Soon)</option>
      </select>
    </div>
  );
};

export default ExerciseSelector;

