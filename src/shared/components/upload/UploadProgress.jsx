import React from 'react';
import '../../styles/upload/UploadProgress.css';

/**
 * UploadProgress - Displays upload/analysis progress
 * 
 * Props:
 * - progress: number - Progress percentage (0-100)
 * - progressText: string - Progress status text
 * - uploading: boolean - Whether upload is in progress
 * - analyzing: boolean - Whether analysis is in progress
 */
const UploadProgress = ({ progress, progressText, uploading, analyzing }) => {
  if (!uploading && !analyzing) return null;

  return (
    <div className="progress">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="progress-text">{progressText}</p>
    </div>
  );
};

export default UploadProgress;

