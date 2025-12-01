import React, { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS, API_URL } from '../../config/api';
import { isUserLoggedIn, getUserToken } from '../utils/authStorage';
import { uploadVideo, uploadVideoOnly } from '../utils/uploadHandler';
import { createErrorWithData } from '../utils/apiErrorHandler';
import { getVideoDuration, getVideoFPS } from '../utils/videoDuration';
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
  const [uploadedSessionId, setUploadedSessionId] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null); // Video duration in seconds
  const [videoFPS, setVideoFPS] = useState(null); // Video FPS (if available from metadata)
  const [videoFrameCount, setVideoFrameCount] = useState(null); // Video frame count (from response - source of truth)
  const [videoFileSize, setVideoFileSize] = useState(null); // Video file size in MB
  const [errorMessage, setErrorMessage] = useState('');  // User-friendly error message
  const [errorData, setErrorData] = useState(null);     // Structured error data (e.g., needs_activation flag)
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(() => {
    if (isLoggedIn) return false;
    return localStorage.getItem('anonymousAnalysisCompleted') === 'true';
  });
  const [notes, setNotes] = useState('');

  // Analysis progress tracking (similar to upload progress)
  const analysisProgressIntervalRef = useRef(null);

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

  // Check if we're on beta (Heroku beta app)
  const isBeta = API_URL.includes('herokuapp.com') || API_URL.includes('beta');

  // Estimate analysis time
  // For beta: uses file size (9s base + file_size_mb * 0.613)
  // For local: uses frame count (5s base + frame_count * 0.015978)
  const estimateAnalysisTime = (durationSeconds, fps = null, frameCount = null, fileSizeMB = null) => {
    // Beta: use file size-based estimation
    if (isBeta && fileSizeMB != null && fileSizeMB > 0) {
      return Math.min(Math.round(9 + (fileSizeMB * 0.613)), 90);
    }
    
    // Local: use frame count-based estimation
    if (frameCount != null && frameCount > 0) {
      return Math.min(Math.round(5 + (frameCount * 0.015978)), 90);
    }
    
    if (!durationSeconds || durationSeconds <= 0) {
      return 30;
    }
    
    const estimatedFPS = fps || 25;
    const estimatedFrameCount = durationSeconds * estimatedFPS;
    return Math.min(Math.round(5 + (estimatedFrameCount * 0.015978)), 90);
  };

  // Start analysis progress tracking
  const startAnalysisProgress = () => {
    // Clear any existing interval
    if (analysisProgressIntervalRef.current) {
      clearInterval(analysisProgressIntervalRef.current);
    }

    const estimatedTime = estimateAnalysisTime(videoDuration, videoFPS, videoFrameCount, videoFileSize);
    const startTime = Date.now();
    const stages = [
      { name: 'Extracting frames', duration: 0.15 },
      { name: 'Detecting pose', duration: 0.25 },
      { name: 'Analyzing form', duration: 0.35 },
      { name: 'Calculating scores', duration: 0.25 },
    ];
    
    let currentStage = 0;
    let stageStartTime = startTime;

    // Update progress every 100ms for smooth animation
    analysisProgressIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedTotal = (now - startTime) / 1000;
      const elapsedStage = (now - stageStartTime) / 1000;
      
      // Calculate progress based on elapsed time (smooth and continuous)
      const progress = Math.min((elapsedTotal / estimatedTime) * 100, 99);
      const timeRemaining = Math.max(0, Math.round(estimatedTime - elapsedTotal));
      updateProgress(progress, `${stages[currentStage].name}... (~${timeRemaining}s remaining)`);

      // Move to next stage if current stage is complete
      const currentStageDuration = estimatedTime * stages[currentStage].duration;
      if (elapsedStage >= currentStageDuration && currentStage < stages.length - 1) {
        currentStage++;
        stageStartTime = now;
      }
    }, 100);
  };

  // Stop analysis progress tracking
  const stopAnalysisProgress = () => {
    if (analysisProgressIntervalRef.current) {
      clearInterval(analysisProgressIntervalRef.current);
      analysisProgressIntervalRef.current = null;
    }
  };

  // Cleanup on unmount - delete uploaded video if user navigates away
  useEffect(() => {
    return () => {
      stopAnalysisProgress();
      // Clean up uploaded video if user navigates away
      if (uploadedSessionId) {
        // Call cleanup endpoint (non-blocking, don't wait for response)
        fetch(API_ENDPOINTS.POSE_CLEANUP_SESSION(uploadedSessionId), {
          method: 'DELETE',
          credentials: 'include',
        }).catch(err => {
          console.warn('Failed to cleanup session on unmount:', err);
        });
      }
    };
  }, [uploadedSessionId]);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a video file first');
      return;
    }

    setErrorMessage('');
    setUploading(true);
    setUploadComplete(false);
    setUploadedSessionId(null);
    updateProgress(0, 'Preparing upload...');

    try {
      const data = await uploadVideoOnly({
        file: selectedFile,
        onProgress: (progress, text) => {
          updateProgress(progress, text);
        }
      });

      // Upload complete
      setUploading(false);
      setUploadComplete(true);
      setUploadedSessionId(data.session_id);
      setProgress(0);
      setProgressText('');
    } catch (error) {
      setUploading(false);
      setUploadComplete(false);
      setProgress(0);
      setProgressText('');
      setErrorMessage(error.message || 'An error occurred during upload');
      setErrorData(error.errorData || null);
    }
  };

  const handleStartAnalysis = async () => {
    if (!uploadComplete || !uploadedSessionId) {
      alert('Please upload the video first');
      return;
    }

    if (!exercise) {
      alert('Please select an exercise type first');
      return;
    }

    setErrorMessage('');
    setAnalyzing(true);
    updateProgress(0, 'Starting analysis...');
    startAnalysisProgress();

    try {
      // Call analyze-video endpoint with session_id
      const formData = new FormData();
      formData.append('session_id', uploadedSessionId);
      formData.append('exercise', exercise);
      if (showNotes && notes && notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const response = await fetch(API_ENDPOINTS.ANALYZE_VIDEO, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${getUserToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.detail?.message || errorData.message || 'Analysis failed';
        throw createErrorWithData(errorMsg, errorData.detail || errorData);
      }

      const data = await response.json();

      setUploading(false);
      setAnalyzing(false);
      setProgress(0);
      setProgressText('');
      
      // Extract frame_count and fps from response for estimation (read-only, same source as plots)
      if (data.frame_count != null) {
        setVideoFrameCount(data.frame_count);
      }
      if (data.fps != null) {
        setVideoFPS(data.fps);
      } else if (data.calculation_results?.fps != null) {
        setVideoFPS(data.calculation_results.fps);
      }
      
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
      stopAnalysisProgress();
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
        <article className={`skeleton-card ${uploadComplete ? 'upload-complete' : (selectedFile && !uploadComplete ? 'upload-pending' : '')}`} ref={shouldSyncHeights ? leftCardRef : null}>
          <FileUploader
            selectedFile={selectedFile}
            onFileChange={async (file) => {
              setSelectedFile(file);
              // Reset upload state when new file is selected
              setUploadComplete(false);
              setUploadedSessionId(null);
              setUploading(false);
              // Clear any previous errors when user selects a new file
              setErrorMessage('');
              setErrorData(null);
              // Get video duration, FPS, and file size when file is selected
              if (file) {
                try {
                  const duration = await getVideoDuration(file);
                  setVideoDuration(duration);
                  const fps = await getVideoFPS(file);
                  setVideoFPS(fps);
                  // Get file size in MB
                  const fileSizeMB = file.size / (1024 * 1024);
                  setVideoFileSize(fileSizeMB);
                } catch (error) {
                  console.warn('Could not get video metadata:', error);
                  setVideoDuration(null);
                  setVideoFPS(null);
                  setVideoFileSize(null);
                }
              } else {
                setVideoDuration(null);
                setVideoFPS(null);
                setVideoFrameCount(null);
                setVideoFileSize(null);
              }
            }}
            disabled={isDisabled}
            uploading={uploading}
            uploadComplete={uploadComplete}
            onUploadClick={handleUpload}
          />
        </article>

        <article className={`skeleton-card ${uploadComplete ? 'analysis-ready' : ''}`} ref={shouldSyncHeights ? rightCardRef : null}>
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
                disabled={!uploadComplete || analyzing || uploading || isDisabled}
              >
                {analyzing ? 'Analyzing...' : 'Start Analysis'}
              </button>
              <p className="skeleton-note">
                Processing takes ~30s.
              </p>
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
              uploading={false}
              analyzing={analyzing}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default AnalysisSkeleton;
