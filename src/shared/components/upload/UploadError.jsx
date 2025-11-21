import React from 'react';
import '../../styles/upload/UploadError.css';

/**
 * UploadError - Displays error messages
 * 
 * Props:
 * - errorMessage: string - Error message to display
 */
const UploadError = ({ errorMessage }) => {
  if (!errorMessage) return null;

  return (
    <div className="error">
      {errorMessage}
    </div>
  );
};

export default UploadError;

