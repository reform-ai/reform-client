import React, { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { isUserLoggedIn } from '../utils/authStorage';
import '../styles/AnalysisSkeletonV2.css';

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const WARNING_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * AnalysisSkeletonV2 - A reusable component for video upload and analysis with dashboard-style visuals
 * 
 * Props:
 * - showNotes: boolean - Whether to show the notes textarea (default: false)
 * - syncCardHeights: boolean - Whether to sync heights of left/right cards (default: false)
 * - headerTitle: string - Title for the header section (default: "Upload a Session")
 * - headerSubtitle: string - Subtitle for the header section
 * - onAnalysisComplete: function - Callback when analysis completes (optional)
 * - onSignInClick: function - Callback when sign in button is clicked (optional)
 */
const AnalysisSkeletonV2 = ({
  showNotes = false,
  syncCardHeights = false,
  headerTitle = "Upload a Session",
  headerSubtitle = null, // If null, will use default based on login status
  onAnalysisComplete = null,
  onSignInClick = null
}) => {
  // Check if user is logged in
  const isLoggedIn = isUserLoggedIn();
  
  // Default subtitles based on login status
  const defaultAnonymousSubtitle = "Select your exercise type and upload a video. Kick off the AI-powered analysis pipeline optimized for Reform athletes.";
  const defaultLoggedInSubtitle = "Select your exercise type, upload a video, and include any coaching notes. Kick off the AI-powered analysis pipeline optimized for Reform athletes.";
  
  // Use provided subtitle or default based on login status
  const displaySubtitle = headerSubtitle !== null 
    ? headerSubtitle 
    : (isLoggedIn ? defaultLoggedInSubtitle : defaultAnonymousSubtitle);

  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [exercise, setExercise] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(() => {
    if (isLoggedIn) return false;
    return localStorage.getItem('anonymousAnalysisCompleted') === 'true';
  });
  const [notes, setNotes] = useState('');

  // Refs
  const fileInputRef = useRef(null);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  // Check anonymous limit on mount (for non-logged-in users)
  useEffect(() => {
    if (!isLoggedIn) {
      fetch(API_ENDPOINTS.CHECK_ANONYMOUS_LIMIT)
        .then(res => res.json())
        .then(data => {
          if (data.limit_reached) {
            setHasCompletedAnalysis(true);
            localStorage.setItem('anonymousAnalysisCompleted', 'true');
          } else if (data.has_limit === false || !data.has_limit) {
            // No limit (e.g., local testing) - clear any existing flag
            setHasCompletedAnalysis(false);
            localStorage.removeItem('anonymousAnalysisCompleted');
          } else {
            // Has limit but not reached - clear flag
            setHasCompletedAnalysis(false);
            localStorage.removeItem('anonymousAnalysisCompleted');
          }
        })
        .catch(err => {
          console.warn('Failed to check anonymous limit:', err);
        });
    }
  }, [isLoggedIn]);

  // Sync card heights if enabled
  useEffect(() => {
    if (!syncCardHeights || window.innerWidth <= 768) return;
    
    const syncHeights = () => {
      if (leftCardRef.current && rightCardRef.current) {
        const leftHeight = leftCardRef.current.offsetHeight;
        const rightHeight = rightCardRef.current.offsetHeight;
        const maxHeight = Math.max(leftHeight, rightHeight);
        leftCardRef.current.style.minHeight = `${maxHeight}px`;
        rightCardRef.current.style.minHeight = `${maxHeight}px`;
      }
    };

    syncHeights();
    window.addEventListener('resize', syncHeights);
    return () => window.removeEventListener('resize', syncHeights);
  }, [syncCardHeights, selectedFile, exercise, uploading, analyzing]);

  const validateFile = (file) => {
    if (!file) {
      return { valid: false, error: 'Please select a video file' };
    }

    if (!file.type.startsWith('video/')) {
      return { valid: false, error: 'Please select a valid video file' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      const maxMB = (MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0);
      return {
        valid: false,
        error: `Video file too large (${sizeMB} MB). Maximum file size: ${maxMB} MB.`,
      };
    }

    if (file.size > WARNING_SIZE_BYTES) {
      console.warn(`⚠️ Large file detected (${(file.size / 1024 / 1024).toFixed(2)} MB). Upload may take longer.`);
    }

    return { valid: true };
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    const validation = validateFile(file);

    if (!validation.valid) {
      alert(validation.error);
      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
  };

  const updateProgress = (value, text) => {
    setProgress(value);
    if (text !== undefined) {
      setProgressText(text);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      alert('Please select a video file first');
      return;
    }

    if (!exercise) {
      alert('Please select an exercise type first');
      return;
    }

    setErrorMessage('');
    setUploading(true);
    setAnalyzing(false);
    updateProgress(0, 'Preparing upload...');

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('exercise', exercise);
      if (showNotes && notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            updateProgress(percentComplete, `Uploading... ${Math.round(percentComplete)}%`);
            if (percentComplete >= 99.9) {
              setUploading(false);
              setAnalyzing(true);
              setProgressText('Upload complete, analyzing...');
            }
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            let errorMsg = 'Network error during upload';
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              if (errorResponse.detail) {
                if (typeof errorResponse.detail === 'string') {
                  errorMsg = errorResponse.detail;
                } else if (errorResponse.detail.message) {
                  errorMsg = errorResponse.detail.message;
                } else {
                  errorMsg = 'Upload failed';
                }
              }
            } catch (e) {
              // Handle status codes
              if (xhr.status === 403) {
                errorMsg = 'Analysis limit reached. Anonymous users are limited to 1 analysis. Please sign up for unlimited analyses.';
              } else if (xhr.status === 402) {
                errorMsg = 'Insufficient tokens. Please wait for daily token reset or upgrade your account.';
              } else if (xhr.status === 413) {
                errorMsg = 'File too large. Maximum size is 500MB.';
              } else if (xhr.status === 415) {
                errorMsg = 'Unsupported file format. Please use MP4, MOV, or AVI.';
              } else if (xhr.status >= 500) {
                errorMsg = 'Server error. Please try again later.';
              }
            }
            reject(new Error(errorMsg));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', API_ENDPOINTS.UPLOAD_VIDEO);
        const token = localStorage.getItem('userToken');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
      });

      setUploading(false);
      setAnalyzing(false);
      setProgress(0);
      setProgressText('');
      
      // Check if analysis completed successfully (has form_analysis or status === 'success')
      if (data.form_analysis || data.status === 'success') {
        // Mark analysis as completed for non-logged-in users
        if (!isLoggedIn) {
          localStorage.setItem('anonymousAnalysisCompleted', 'true');
          setHasCompletedAnalysis(true);
        }
        
        // If logged in and response includes token info, trigger token refresh in ProfileMenu
        if (isLoggedIn && data.tokens_remaining !== undefined) {
          // Dispatch custom event to update token count in ProfileMenu
          window.dispatchEvent(new CustomEvent('tokensUpdated', { detail: { tokens_remaining: data.tokens_remaining } }));
        }
        
        // If callback provided, use it; otherwise redirect (if analysis_id exists)
        if (onAnalysisComplete) {
          onAnalysisComplete(data);
        } else if (data.analysis_id) {
          window.location.href = `/analysis/${data.analysis_id}`;
        }
      }
    } catch (error) {
      setUploading(false);
      setAnalyzing(false);
      setProgress(0);
      setProgressText('');
      setErrorMessage(error.message || 'An error occurred during analysis');
    }
  };

  const selectedFileName = selectedFile ? selectedFile.name : 'No file selected yet.';
  const isDisabled = !isLoggedIn && hasCompletedAnalysis;
  const shouldSyncHeights = syncCardHeights && window.innerWidth > 768;

  return (
    <div className="skeleton-v2-shell">
      <header className="skeleton-v2-header">
        <div>
          <p className="skeleton-v2-eyebrow">New Analysis</p>
          <h1 className="skeleton-v2-title">{headerTitle}</h1>
          <p className="skeleton-v2-subtitle">{displaySubtitle}</p>
        </div>
      </header>

      <div className="skeleton-v2-grid">
        <article className="skeleton-v2-card" ref={shouldSyncHeights ? leftCardRef : null}>
          <div className="skeleton-v2-upload-content">
            <h3>Upload Your Video</h3>
            <div className="skeleton-v2-upload-area" style={isDisabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
              <label className="skeleton-v2-upload-label" style={{ justifyContent: 'center', alignSelf: 'center', width: 'auto' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={isDisabled}
                />
                <span className="skeleton-v2-upload-text skeleton-v2-upload-text-desktop">Drag & drop or click to select</span>
                <span className="skeleton-v2-upload-text skeleton-v2-upload-text-mobile" style={{ display: 'none' }}>
                  Click to upload
                </span>
              </label>
              <p className="skeleton-v2-upload-guidance" style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Supported formats: MP4, MOV, AVI • Up to 2 minutes • Ensure clear lighting
              </p>
            </div>
            <div className={`skeleton-v2-upload-file-info${selectedFile ? ' has-file' : ''}`}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFileName}</span>
            </div>
          </div>
        </article>

        <article className="skeleton-v2-card" ref={shouldSyncHeights ? rightCardRef : null}>
          <h3>Analysis Details</h3>
          <div className="skeleton-v2-options">
            <div className="skeleton-v2-select-group">
              <label htmlFor="exercise">Exercise Type</label>
              <select
                id="exercise"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                disabled={isDisabled}
              >
                <option value="">-- Select Exercise --</option>
                <option value="1">Squat</option>
                <option value="2" disabled>Bench (Coming Soon)</option>
                <option value="3" disabled>Deadlift (Coming Soon)</option>
              </select>
            </div>

            {showNotes && (
              <div className="skeleton-v2-select-group">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea 
                  id="notes" 
                  placeholder="What should we focus on for this set?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isDisabled}
                ></textarea>
              </div>
            )}

            <div className="skeleton-v2-actions">
              <button
                className="skeleton-v2-btn skeleton-v2-btn-primary"
                type="button"
                onClick={handleStartAnalysis}
                disabled={uploading || analyzing || isDisabled}
              >
                {analyzing ? 'Analyzing...' : uploading ? 'Uploading...' : 'Start Analysis'}
              </button>
              <p className="skeleton-v2-note">Processing takes ~45s.</p>
            </div>
            
            {isDisabled && (
              <div className="skeleton-v2-limit-message">
                You've reached the limit for anonymous analysis. <button 
                  onClick={() => onSignInClick?.()}
                  className="skeleton-v2-signin-link"
                >
                  Sign in
                </button> to continue.
              </div>
            )}

            {errorMessage && (
              <div className="skeleton-v2-error">
                {errorMessage}
              </div>
            )}

            {(uploading || analyzing) && (
              <div className="skeleton-v2-progress">
                <div className="skeleton-v2-progress-bar">
                  <div 
                    className="skeleton-v2-progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="skeleton-v2-progress-text">{progressText}</p>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default AnalysisSkeletonV2;

