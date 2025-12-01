import React, { useRef } from 'react';
import { validateFile } from '../../utils/fileValidation';
import '../../styles/upload/FileUploader.css';

/**
 * FileUploader - Handles file selection and validation
 * 
 * Props:
 * - selectedFile: File | null - Currently selected file
 * - onFileChange: (file: File | null) => void - Callback when file changes
 * - disabled: boolean - Whether uploader is disabled
 * - uploading: boolean - Whether upload is in progress
 * - uploadComplete: boolean - Whether upload is complete
 * - onUploadClick: () => void - Callback when upload button is clicked
 */
const FileUploader = ({ selectedFile, onFileChange, disabled = false, uploading = false, uploadComplete = false, onUploadClick = null }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    const validation = validateFile(file);

    if (!validation.valid) {
      alert(validation.error);
      event.target.value = '';
      onFileChange(null);
      return;
    }

    onFileChange(file);
  };

  const selectedFileName = selectedFile ? selectedFile.name : 'No file selected yet.';

  return (
    <div className="upload-content">
      <h3>{uploadComplete ? 'Change Video?' : 'Upload Your Video'}</h3>
      <div className="upload-area" style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
        <label className="upload-label" style={{ justifyContent: 'center', alignSelf: 'center', width: 'auto' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={disabled}
          />
          <span className="upload-text upload-text-desktop">Drag & drop or click to select</span>
          <span className="upload-text upload-text-mobile" style={{ display: 'none' }}>
            Click to upload
          </span>
        </label>
        <p className="upload-guidance" style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Supported formats: MP4, MOV, AVI • Up to 2 minutes • Ensure clear lighting
        </p>
      </div>
      <div className={`upload-file-info${selectedFile ? ' has-file' : ''}`}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFileName}</span>
      </div>
      {selectedFile && (
        <div className="upload-button-container">
          <button 
            className="upload-button" 
            disabled={disabled || uploading}
            onClick={onUploadClick}
          >
            Upload
          </button>
          {uploading && (
            <div className="upload-spinner"></div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;

