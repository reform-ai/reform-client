import React, { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { isUserLoggedIn } from '../utils/authStorage';
import { uploadVideo } from '../utils/uploadHandler';
import FileUploader from '../components/upload/FileUploader';
import ExerciseSelector from '../components/upload/ExerciseSelector';
import NotesInput from '../components/upload/NotesInput';
import UploadProgress from '../components/upload/UploadProgress';
import UploadError from '../components/upload/UploadError';
import AnonymousLimitMessage from '../components/upload/AnonymousLimitMessage';
import '../styles/AnalysisSkeleton.css';

/**
 * AnalysisSkeleton - A reusable component for video upload and analysis with dashboard-style visuals
 * 
 * Props:
 * - showNotes: boolean - Whether to show the notes textarea (default: false)
 * - syncCardHeights: boolean - Whether to sync heights of left/right cards (default: false)
 * - headerTitle: string - Title for the header section (default: "Upload a Session")
 * - headerSubtitle: string - Subtitle for the header section
 * - onAnalysisComplete: function - Callback when analysis completes (optional)
 * - onSignInClick: function - Callback when sign in button is clicked (optional)
 */
const AnalysisSkeleton = ({
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
  const [errorMessage, setErrorMessage] = useState('');  // User-friendly error message
  const [errorData, setErrorData] = useState(null);     // Structured error data (e.g., needs_activation flag)
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(() => {
    if (isLoggedIn) return false;
    return localStorage.getItem('anonymousAnalysisCompleted') === 'true';
  });
  const [notes, setNotes] = useState('');

  // Refs
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
      const data = await uploadVideo({
        file: selectedFile,
        exercise,
        notes: showNotes ? notes : null,
        onProgress: (progress, text) => {
          updateProgress(progress, text);
          if (progress >= 99.9) {
            setUploading(false);
            setAnalyzing(true);
            updateProgress(100, 'Upload complete, analyzing...');
          }
        }
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
      
      // Extract error message and structured data from error object
      // errorData contains info like needs_activation flag for UI customization
      setErrorMessage(error.message || 'An error occurred during analysis');
      setErrorData(error.errorData || null);
    }
  };

  const isDisabled = !isLoggedIn && hasCompletedAnalysis;
  const shouldSyncHeights = syncCardHeights && window.innerWidth > 768;

  return (
    <div className="skeleton-shell">
      <header className="skeleton-header">
        <div>
          <p className="skeleton-eyebrow">New Analysis</p>
          <h1 className="skeleton-title">{headerTitle}</h1>
          <p className="skeleton-subtitle">{displaySubtitle}</p>
        </div>
      </header>

      <div className="skeleton-grid">
        <article className="skeleton-card" ref={shouldSyncHeights ? leftCardRef : null}>
          <FileUploader
            selectedFile={selectedFile}
            onFileChange={(file) => {
              setSelectedFile(file);
              // Clear any previous errors when user selects a new file
              setErrorMessage('');
              setErrorData(null);
            }}
            disabled={isDisabled}
          />
        </article>

        <article className="skeleton-card" ref={shouldSyncHeights ? rightCardRef : null}>
          <h3>Analysis Details</h3>
          <div className="skeleton-options">
            <ExerciseSelector
              value={exercise}
              onChange={setExercise}
              disabled={isDisabled}
            />

            {showNotes && (
              <NotesInput
                value={notes}
                onChange={setNotes}
                disabled={isDisabled}
              />
            )}

            <div className="skeleton-actions">
              <button
                className="skeleton-btn skeleton-btn-primary"
                type="button"
                onClick={handleStartAnalysis}
                disabled={uploading || analyzing || isDisabled}
              >
                {analyzing ? 'Analyzing...' : uploading ? 'Uploading...' : 'Start Analysis'}
              </button>
              <p className="skeleton-note">Processing takes ~45s.</p>
            </div>
            
            {isDisabled && (
              <AnonymousLimitMessage onSignInClick={onSignInClick} />
            )}

            <UploadError 
              errorMessage={errorMessage} 
              errorData={errorData}
              onActivationComplete={() => {
                // User successfully activated tokens - clear error state
                setErrorMessage('');
                setErrorData(null);
                
                // Notify ProfileMenu to refresh token count display
                window.dispatchEvent(new CustomEvent('tokensUpdated'));
                
                // User can now retry the upload
              }}
            />

            <UploadProgress
              progress={progress}
              progressText={progressText}
              uploading={uploading}
              analyzing={analyzing}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default AnalysisSkeleton;
