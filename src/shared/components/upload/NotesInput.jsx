import React from 'react';
import '../../styles/upload/ExerciseSelector.css';

/**
 * NotesInput - Optional notes textarea
 * 
 * Props:
 * - value: string - Current notes value
 * - onChange: (value: string) => void - Callback when notes change
 * - disabled: boolean - Whether input is disabled
 */
const NotesInput = ({ value, onChange, disabled = false }) => {
  return (
    <div className="select-group">
      <label htmlFor="notes">Notes (optional)</label>
      <textarea 
        id="notes" 
        placeholder="What should we focus on for this set?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      ></textarea>
    </div>
  );
};

export default NotesInput;

