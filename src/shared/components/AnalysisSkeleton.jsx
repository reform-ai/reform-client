import React, { useState, useRef, useEffect } from 'react';
import '../utils/chartConfig';
import ScoreBreakdown from './ScoreBreakdown';
import AnglePlot from './charts/AnglePlot';
import { API_ENDPOINTS } from '../../config/api';
import '../../pages/DashboardAnalyze.css';

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const WARNING_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * AnalysisSkeleton - A reusable component for video upload and analysis
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
  headerSubtitle = "Select your exercise type, upload a video, and include any coaching notes. Kick off the AI-powered analysis pipeline optimized for Reform athletes.",
  onAnalysisComplete = null,
  onSignInClick = null
}) => {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [exercise, setExercise] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [results, setResults] = useState(null);
  // Check localStorage for persisted anonymous analysis completion
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(() => {
    if (isLoggedIn) return false;
    return localStorage.getItem('anonymousAnalysisCompleted') === 'true';
  });
  const [expandedStates, setExpandedStates] = useState({
    torso_angle: false,
    quad_angle: false,
    asymmetry: false,
    torso_asymmetry: false,
    quad_asymmetry: false,
    ankle_asymmetry: false,
    rep_consistency: false,
    movement: false,
    knee_valgus: false
  });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [notes, setNotes] = useState('');

  // Refs
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);
  const videoRef = useRef(null);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  // Check anonymous limit on mount (for non-logged-in users)
  useEffect(() => {
    if (!isLoggedIn && !hasCompletedAnalysis) {
      // Check with backend if limit is reached
      fetch(API_ENDPOINTS.CHECK_ANONYMOUS_LIMIT)
        .then(res => res.json())
        .then(data => {
          if (data.limit_reached) {
            setHasCompletedAnalysis(true);
            localStorage.setItem('anonymousAnalysisCompleted', 'true');
          }
        })
        .catch(err => {
          // Silently fail - user can still try to upload
          console.warn('Failed to check anonymous limit:', err);
        });
    }
  }, [isLoggedIn, hasCompletedAnalysis]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsVideoExpanded(isFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Optional: Sync card heights
  useEffect(() => {
    if (!syncCardHeights) return;

    const syncHeights = () => {
      if (rightCardRef.current && leftCardRef.current) {
        const rightHeight = rightCardRef.current.offsetHeight;
        leftCardRef.current.style.height = `${rightHeight}px`;
      }
    };

    syncHeights();
    window.addEventListener('resize', syncHeights);
    
    // Use MutationObserver to watch for content changes
    const observer = new MutationObserver(syncHeights);
    if (rightCardRef.current) {
      observer.observe(rightCardRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    return () => {
      window.removeEventListener('resize', syncHeights);
      observer.disconnect();
    };
  }, [syncCardHeights, uploading, analyzing, progress, errorMessage]);

  // Handlers
  const handleToggleExpanded = (key) => {
    setExpandedStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const handleExpandVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

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
    setResults(null);
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
                  // Handle structured error response with message field
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

        // Open the request first (required before setting headers)
        xhr.open('POST', API_ENDPOINTS.UPLOAD_VIDEO);
        
        // Add authorization header if token exists
        // Note: Upload endpoint doesn't require auth, but we send it for future use
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
      setResults(data);
      
      // Mark analysis as completed for non-logged-in users and persist to localStorage
      if (!isLoggedIn) {
        setHasCompletedAnalysis(true);
        localStorage.setItem('anonymousAnalysisCompleted', 'true');
      }
      
      // If logged in and response includes token info, trigger token refresh in ProfileMenu
      if (isLoggedIn && data.tokens_remaining !== undefined) {
        // Dispatch custom event to update token count in ProfileMenu
        window.dispatchEvent(new CustomEvent('tokensUpdated', { detail: { tokens_remaining: data.tokens_remaining } }));
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (error) {
      setUploading(false);
      setAnalyzing(false);
      setProgress(0);
      setProgressText('');
      setErrorMessage(error.message || 'An error occurred during analysis');
    }
  };

  // Calculate component scores
  const componentScores = results?.form_analysis?.final_score?.component_scores || {};

  // Get selected file name
  const selectedFileName = selectedFile ? selectedFile.name : 'No file selected yet.';
  
  // Disable upload and analyze for non-logged-in users after first successful analysis
  const isDisabled = !isLoggedIn && hasCompletedAnalysis;

  return (
    <div className="dashboard-analyze">
      <div className="shell">
        <header className="header">
          <div>
            <p style={{ letterSpacing: '0.25em', color: 'var(--accent-green)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
              New Analysis
            </p>
            <h1 className="header-title">{headerTitle}</h1>
            <p className="header-subtitle">
              {headerSubtitle}
            </p>
          </div>
        </header>

        <div className="analysis-grid">
          <article className="card" ref={syncCardHeights ? leftCardRef : null}>
            <div className="upload-card-content">
              <h3>Upload Your Video</h3>
              <div className="upload-area" style={isDisabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
                <label className="upload-label">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={isDisabled}
                  />
                  <span>Drag & drop or click to select</span>
                </label>
                <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Supported formats: MP4, MOV, AVI • Up to 2 minutes • Ensure clear lighting
                </p>
              </div>
              <div className={`upload-file-info${selectedFile ? ' has-file' : ''}`}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFileName}</span>
              </div>
            </div>
          </article>

          <article className="card" ref={syncCardHeights ? rightCardRef : null}>
            <h3>Analysis Details</h3>
            <div className="analysis-options">
              <div className="select-group">
                <label htmlFor="exercise">Exercise Type</label>
                <select
                  id="exercise"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  disabled={isDisabled}
                >
                  <option value="">-- Select Exercise --</option>
                  <option value="1">Squat</option>
                  <option value="2" disabled>
                    Bench (Coming Soon)
                  </option>
                  <option value="3" disabled>
                    Deadlift (Coming Soon)
                  </option>
                </select>
              </div>

              {showNotes && (
                <div className="select-group">
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

              <div className="analysis-actions">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={uploading || analyzing || isDisabled}
                >
                  {analyzing ? 'Analyzing...' : uploading ? 'Uploading...' : 'Start Analysis'}
                </button>
                <p className="analysis-note">Processing takes ~45s.</p>
              </div>
              
              {isDisabled && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px'
                }}>
                  <p style={{ 
                    margin: 0, 
                    color: 'var(--accent-green)', 
                    fontSize: '0.9rem', 
                    fontWeight: 500 
                  }}>
                    Sign in to run multiple analyses
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSignInClick) {
                          onSignInClick();
                        } else {
                          window.location.href = '/?login=1';
                        }
                      }}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '6px',
                        border: '1px solid var(--accent-green)',
                        backgroundColor: 'transparent',
                        color: 'var(--accent-green)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--accent-green)';
                        e.target.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'var(--accent-green)';
                      }}
                    >
                      Sign in
                    </button>
                    <a
                      href="/signup"
                      style={{
                        padding: '6px 16px',
                        borderRadius: '6px',
                        border: '1px solid var(--accent-green)',
                        backgroundColor: 'var(--accent-green)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        display: 'inline-block'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'var(--accent-green)';
                      }}
                    >
                      Sign up
                    </a>
                  </div>
                </div>
              )}

              <div className="analysis-upload-status" style={{ minHeight: '90px' }}>
                {(uploading || analyzing || progress > 0 || errorMessage) && (
                  <>
                    {uploading && !analyzing && (
                      <>
                        <div style={{
                          width: '100%',
                          height: '20px',
                          backgroundColor: 'var(--bg-tertiary)',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          position: 'relative',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: 'var(--score-excellent)',
                            transition: 'width 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {progress >= 10 && `${progress.toFixed(0)}%`}
                          </div>
                        </div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          Uploading: {progress.toFixed(1)}%
                        </p>
                      </>
                    )}
                    {analyzing && (
                      <div style={{
                        padding: '15px',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            border: '3px solid var(--bg-tertiary)',
                            borderTop: '3px solid var(--score-excellent)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>
                            Analyzing video...
                          </p>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Extracting frames, detecting pose, and analyzing form. This may take a moment.
                        </p>
                      </div>
                    )}
                    {errorMessage && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          color: 'var(--accent-orange)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {errorMessage}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </article>
        </div>

        {/* Results Display */}
        <div
          ref={resultsRef}
          style={{ 
            marginTop: '15px', 
            padding: results ? '10px' : '0',
            backgroundColor: results ? 'var(--card-bg)' : 'transparent',
            border: results ? '1px solid var(--score-excellent)' : 'none',
            borderRadius: '8px',
            maxHeight: results ? '85vh' : 'auto',
            overflowY: results ? 'auto' : 'visible',
            minHeight: results ? 'auto' : '0'
          }}
        >
          {results && (
            <>
              {results.camera_angle_info?.should_warn && (
                <details style={{ marginTop: '15px' }}>
                  <summary style={{ 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    padding: '12px',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--score-warning)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}>
                    ⚠️ Camera Angle Warning
                  </summary>
                  <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', marginTop: '5px', border: '1px solid var(--border-color)' }}>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {results.camera_angle_info.message}
                    </p>
                    {results.camera_angle_info.angle_estimate && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        Estimated angle: {results.camera_angle_info.angle_estimate}°
                      </p>
                    )}
                  </div>
                </details>
              )}

              {results.form_analysis?.final_score && (
                <div className="analysis-layout" style={{ marginTop: '15px' }}>
                  <div className="form-score-container" style={{
                    flex: '1',
                    minWidth: 0
                  }}>
                    <ScoreBreakdown
                      formAnalysis={results.form_analysis}
                      componentScores={componentScores}
                      calculationResults={results.calculation_results}
                      squatPhases={results.squat_phases}
                      frameCount={results.frame_count}
                      expandedStates={expandedStates}
                      onToggleExpanded={handleToggleExpanded}
                      fps={results.calculation_results?.fps || results.fps || null}
                    />
                    
                    {results.calculation_results?.angles_per_frame && (
                      <details style={{ marginTop: '20px' }}>
                        <summary style={{ 
                          cursor: 'pointer', 
                          fontWeight: 'bold',
                          padding: '12px',
                          backgroundColor: 'var(--card-bg)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)'
                        }}>
                          📈 Angle Analysis Plots
                        </summary>
                        <div className="angle-analysis-plot-container" style={{ marginTop: '10px' }}>
                          <AnglePlot
                            anglesPerFrame={results.calculation_results.angles_per_frame}
                            frameCount={results.frame_count}
                            squatPhases={results.squat_phases}
                            fps={results.calculation_results?.fps || results.fps || 30}
                            calculationResults={results.calculation_results}
                          />
                        </div>
                      </details>
                    )}
                  </div>

                  <div style={{
                    flex: '1',
                    minWidth: 0
                  }}>
                    {results.visualization_url && (
                      <div className="video-container" style={{ 
                        position: 'relative',
                        width: '100%'
                      }}>
                        <div style={{ 
                          position: 'relative',
                          width: '100%',
                          backgroundColor: 'var(--card-bg)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          overflow: 'hidden'
                        }}>
                          <video 
                            ref={videoRef}
                            src={results.visualization_url}
                            controls
                            onPlay={handleVideoPlay}
                            onPause={handleVideoPause}
                            style={{
                              width: '100%',
                              height: 'auto',
                              maxHeight: '50vh',
                              display: 'block',
                              objectFit: 'contain'
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                          {isVideoPlaying && (
                            <button
                              onClick={handleExpandVideo}
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                padding: '8px 16px',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '14px',
                                zIndex: 10
                              }}
                            >
                              {isVideoExpanded ? 'Exit Fullscreen' : 'Fullscreen'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisSkeleton;

