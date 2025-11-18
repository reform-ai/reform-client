// Video upload handler for iPhone - React component
// Handles user input when upload button is clicked

import React, { useState, useRef, useEffect } from 'react';
// Chart.js registration is handled in shared/utils/chartConfig.js
import '../../shared/utils/chartConfig';
import ScoreBreakdown from '../../shared/components/ScoreBreakdown';
import AnglePlot from '../../shared/components/charts/AnglePlot';
import { API_ENDPOINTS } from '../../config/api';

function UploadVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
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
  const [exerciseType, setExerciseType] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

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
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const hasSuccessfulUpload = uploadStatus?.success;
  const finalScoreData = hasSuccessfulUpload ? uploadStatus.data.form_analysis?.final_score : null;
  const componentScores = finalScoreData?.component_scores || {};

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    
    // Ensure only one file is selected
    if (files.length > 1) {
      alert('Please select only one video file at a time.');
      event.target.value = '';
      setVideoFile(null);
      return;
    }
    
    const file = files[0];
    if (file && file.type.startsWith('video/')) {
      const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
      const WARNING_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
      
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        const maxMB = (MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0);
        alert(`Video file too large (${sizeMB} MB). Maximum file size: ${maxMB} MB.\n\nPlease select a smaller video file or compress your video.`);
        event.target.value = '';
        setVideoFile(null);
        return;
      }
      
      if (file.size > WARNING_SIZE_BYTES) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        console.warn(`⚠️ Large file detected (${sizeMB} MB). Upload may take longer.`);
      }
      
      const video = document.createElement('video');
      video.preload = 'metadata';
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      
      const METADATA_TIMEOUT_MS = 5000; // 5 seconds timeout
      let metadataTimeout = null;
      
      const createVideoObject = (duration = null) => {
        const obj = {
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        };
        if (duration !== null && !isNaN(duration) && duration > 0) {
          obj.duration = duration;
        }
        return obj;
      };
      
      const cleanup = () => {
        if (metadataTimeout) {
          clearTimeout(metadataTimeout);
          metadataTimeout = null;
        }
        URL.revokeObjectURL(videoUrl);
      };
      
      video.onloadedmetadata = () => {
        cleanup();
        const duration = video.duration;
        const MAX_DURATION_SECONDS = 120;
        
        if (isNaN(duration) || duration === 0) {
          console.warn('⚠️ Could not read video duration. Proceeding with upload (backend will validate).');
          const videoObject = createVideoObject();
          setVideoFile(videoObject);
          console.log('✅ Video file selected and stored:', videoObject);
          return;
        }
        
        if (duration > MAX_DURATION_SECONDS) {
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          alert(`Video too long (${minutes}:${seconds.toString().padStart(2, '0')}). Maximum duration: ${MAX_DURATION_SECONDS} seconds (2 minutes).\n\nPlease select a shorter video.`);
          event.target.value = '';
          setVideoFile(null);
          return;
        }
        
        const videoObject = createVideoObject(duration);
        setVideoFile(videoObject);
        console.log('✅ Video file selected and stored:', videoObject);
        console.log('📹 Full File object:', file);
      };
      
      video.onerror = () => {
        cleanup();
        console.warn('⚠️ Could not read video metadata. Proceeding with upload (backend will validate).');
        const videoObject = createVideoObject();
        setVideoFile(videoObject);
        console.log('✅ Video file selected and stored (metadata unavailable):', videoObject);
      };
      
      metadataTimeout = setTimeout(() => {
        cleanup();
        console.warn('⚠️ Video metadata loading timeout. Proceeding with upload (backend will validate).');
        const videoObject = createVideoObject();
        setVideoFile(videoObject);
        console.log('✅ Video file selected and stored (metadata timeout):', videoObject);
      }, METADATA_TIMEOUT_MS);
    } else {
      alert('Please select a valid video file');
    }
  };


  const handleSendToBackend = async () => {
    if (!videoFile || !videoFile.file) {
      alert('Please select a video file first');
      return;
    }

    if (!exerciseType) {
      alert('Please select an exercise type first');
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', videoFile.file);
      formData.append('exercise', exerciseType.toString());

      console.log('📤 Sending video to backend...', {
        name: videoFile.name,
        size: videoFile.size,
        type: videoFile.type,
        exercise: exerciseType
      });

      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(percentComplete);
            console.log(`📤 Upload progress: ${percentComplete.toFixed(1)}%`);
            if (percentComplete >= 99.9) {
              console.log('✅ Upload complete, starting analysis...');
              setAnalyzing(true);
            }
          }
        });

        xhr.addEventListener('load', () => {
          console.log('📥 Response received, status:', xhr.status);
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            if (!analyzing) {
              console.log('✅ Setting analyzing to true (response received)');
              setAnalyzing(true);
            }
            try {
              const responseData = JSON.parse(xhr.responseText);
              console.log('✅ Analysis complete, resolving...');
              resolve({ success: true, data: responseData });
            } catch (parseError) {
              setAnalyzing(false);
              reject(new Error('Failed to parse response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error('❌ Backend Error Response:', errorData);
              console.error('❌ Full XHR Response:', {
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText,
                responseHeaders: xhr.getAllResponseHeaders()
              });
              const errorMessage = errorData.detail?.message || errorData.detail?.error || errorData.message || `Upload failed with status ${xhr.status}`;
              const errorDetail = errorData.detail || errorData || {};
              resolve({ 
                success: false, 
                error: errorMessage,
                errorDetail: errorDetail,
                rawError: errorData,
                status: xhr.status,
                statusText: xhr.statusText
              });
            } catch (parseError) {
              console.error('❌ Failed to parse error response:', parseError);
              console.error('❌ Raw response text:', xhr.responseText);
              reject(new Error(`Upload failed with status ${xhr.status}. Response: ${xhr.responseText}`));
            }
          }
        });

        xhr.addEventListener('error', (e) => {
          console.error('❌ XHR Network Error:', e);
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          console.error('❌ Upload aborted by user');
          reject(new Error('Upload aborted'));
        });

        const uploadUrl = API_ENDPOINTS.UPLOAD_VIDEO;
        console.log('📤 Uploading to:', uploadUrl);
        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });

      if (data.success) {
        setAnalyzing(false);
        setUploadStatus({ success: true, data: data.data });
        console.log('✅ Video uploaded successfully:', data.data);
      } else {
        setAnalyzing(false);
        setUploadStatus({ 
          success: false, 
          error: data.error,
          errorDetail: data.errorDetail,
          rawError: data.rawError,
          status: data.status,
          statusText: data.statusText
        });
        console.error('❌ Upload failed:', data);
      }
    } catch (error) {
      setAnalyzing(false);
      console.error('❌ Exception during upload:', error);
      console.error('❌ Error stack:', error.stack);
      setUploadStatus({ 
        success: false, 
        error: error.message,
        errorDetail: {
          error: 'upload_exception',
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      });
    } finally {
      setUploading(false);
      if (!analyzing) {
        setUploadProgress(0);
      }
    }
  };

  return (
    <div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        multiple={false}
        style={{ display: 'none' }}
      />
      {uploadStatus && uploadStatus.success ? (
        <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          <label style={{ 
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontSize: '1rem',
            margin: 0,
            whiteSpace: 'nowrap'
          }}>
            Select Exercise Type:
          </label>
          <select
            value={exerciseType || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              setExerciseType(value);
            }}
            style={{
              padding: '12px 40px 12px 16px',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '1rem',
              fontFamily: 'Inter, sans-serif',
              minWidth: '200px',
              transition: 'all 0.2s ease',
              outline: 'none',
              flexShrink: 0
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--border-color-hover)';
              e.target.style.backgroundColor = 'var(--card-hover)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.backgroundColor = 'var(--card-bg)';
            }}
            onMouseEnter={(e) => {
              if (document.activeElement !== e.target) {
                e.target.style.borderColor = 'var(--border-color-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (document.activeElement !== e.target) {
                e.target.style.borderColor = 'var(--border-color)';
              }
            }}
          >
            <option value="" disabled>
              -- Select Exercise --
            </option>
            <option value="1">
              Squat
            </option>
            <option value="2" disabled>
              Bench (Coming Soon)
            </option>
            <option value="3" disabled>
              Deadlift (Coming Soon)
            </option>
          </select>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'nowrap' }}>
            <button
              onClick={handleUploadClick}
              style={{ 
                padding: '12px 24px', 
                margin: 0,
                backgroundColor: 'var(--button-bg)',
                color: 'var(--button-text)',
                border: `1px solid var(--button-border)`,
                borderRadius: '8px',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--button-hover)';
                e.target.style.borderColor = 'var(--border-color-hover)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--button-bg)';
                e.target.style.borderColor = 'var(--button-border)';
              }}
            >
              {videoFile ? 'Change video' : 'Select Video'}
            </button>
            {videoFile && (
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexShrink: 1
              }} title={videoFile.name}>
                {videoFile.name}
              </span>
            )}
            <button
              onClick={handleSendToBackend}
              disabled={!videoFile || uploading || analyzing}
              style={{ 
                padding: '12px 24px', 
                margin: 0,
                backgroundColor: (!videoFile || uploading || analyzing) ? 'var(--bg-tertiary)' : 'var(--score-excellent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (!videoFile || uploading || analyzing) ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s ease',
                opacity: (!videoFile || uploading || analyzing) ? 0.6 : 1,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (videoFile && !uploading && !analyzing) {
                  e.target.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (videoFile && !uploading && !analyzing) {
                  e.target.style.opacity = '1';
                }
              }}
            >
              {analyzing ? 'Analyzing...' : uploading ? 'Uploading...' : 'Analyze!'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ 
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontSize: '1rem',
              margin: 0
            }}>
              Select Exercise Type:
            </label>
            <select
              value={exerciseType || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                setExerciseType(value);
              }}
              style={{
                padding: '12px 40px 12px 16px',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '1rem',
                fontFamily: 'Inter, sans-serif',
                minWidth: '200px',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--border-color-hover)';
                e.target.style.backgroundColor = 'var(--card-hover)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.backgroundColor = 'var(--card-bg)';
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target) {
                  e.target.style.borderColor = 'var(--border-color-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target) {
                  e.target.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              <option value="" disabled>
                -- Select Exercise --
              </option>
              <option value="1">
                Squat
              </option>
              <option value="2" disabled>
                Bench (Coming Soon)
              </option>
              <option value="3" disabled>
                Deadlift (Coming Soon)
              </option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={handleUploadClick}
                style={{ 
                  padding: '12px 24px', 
                  margin: '10px 0 0 0',
                  backgroundColor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  border: `1px solid var(--button-border)`,
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--button-hover)';
                  e.target.style.borderColor = 'var(--border-color-hover)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--button-bg)';
                  e.target.style.borderColor = 'var(--button-border)';
                }}
              >
                {videoFile ? 'Change video' : 'Select Video'}
              </button>
              {videoFile && (
                <p style={{ 
                  margin: '4px 0 10px 0', 
                  fontSize: '12px', 
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} title={videoFile.name}>
                  {videoFile.name}
                </p>
              )}
            </div>
            <button
              onClick={handleSendToBackend}
              disabled={!videoFile || uploading || analyzing}
              style={{ 
                padding: '12px 24px', 
                margin: '10px 0',
                backgroundColor: (!videoFile || uploading || analyzing) ? 'var(--bg-tertiary)' : 'var(--score-excellent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (!videoFile || uploading || analyzing) ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s ease',
                opacity: (!videoFile || uploading || analyzing) ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (videoFile && !uploading && !analyzing) {
                  e.target.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (videoFile && !uploading && !analyzing) {
                  e.target.style.opacity = '1';
                }
              }}
            >
              {analyzing ? 'Analyzing...' : uploading ? 'Uploading...' : 'Analyze!'}
            </button>
          </div>
        </>
      )}
      {videoFile && (
        <div>
          {(uploading || analyzing) && (
            <div style={{ marginTop: '10px', width: '300px' }}>
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
                      width: `${uploadProgress}%`,
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
                      {uploadProgress >= 10 && `${uploadProgress.toFixed(0)}%`}
                    </div>
                  </div>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Uploading: {uploadProgress.toFixed(1)}%
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
            </div>
          )}
        </div>
      )}
      {uploadStatus && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: uploadStatus.success ? 'var(--card-bg)' : 'var(--card-bg)',
          border: `1px solid ${uploadStatus.success ? 'var(--score-excellent)' : 'var(--score-poor)'}`,
          borderRadius: '8px',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}>
          {uploadStatus.success ? (
            <div>
              {uploadStatus.data.camera_angle_info?.should_warn && (
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
                      {uploadStatus.data.camera_angle_info.message}
                    </p>
                    {uploadStatus.data.camera_angle_info.angle_estimate && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        Estimated angle: {uploadStatus.data.camera_angle_info.angle_estimate}°
                      </p>
                    )}
                  </div>
                </details>
              )}

              {uploadStatus.data.form_analysis?.final_score && (
                <div className="analysis-layout" style={{ marginTop: '15px' }}>
                  <div style={{
                    flex: '1',
                    minWidth: 0
                  }}>
                    <ScoreBreakdown
                      formAnalysis={uploadStatus.data.form_analysis}
                      componentScores={componentScores}
                      calculationResults={uploadStatus.data.calculation_results}
                      squatPhases={uploadStatus.data.squat_phases}
                      frameCount={uploadStatus.data.frame_count}
                      expandedStates={expandedStates}
                      onToggleExpanded={handleToggleExpanded}
                      fps={uploadStatus.data.calculation_results?.fps || uploadStatus.data.fps || null}
                    />
                    
                    {uploadStatus.data.calculation_results?.angles_per_frame && (
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
                        <div style={{ marginTop: '10px' }}>
                          <AnglePlot
                            anglesPerFrame={uploadStatus.data.calculation_results.angles_per_frame}
                            frameCount={uploadStatus.data.frame_count}
                            squatPhases={uploadStatus.data.squat_phases}
                            fps={uploadStatus.data.calculation_results?.fps || uploadStatus.data.fps || 30}
                            calculationResults={uploadStatus.data.calculation_results}
                          />
                        </div>
                      </details>
                    )}
                  </div>

                  <div style={{
                    flex: '1',
                    minWidth: 0
                  }}>
                    {uploadStatus.data.visualization_url && (
                      <div style={{ 
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
                            src={uploadStatus.data.visualization_url}
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
                                fontFamily: 'Inter, sans-serif',
                                transition: 'all 0.2s ease',
                                zIndex: 10
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                              }}
                            >
                              ⛶ Expand
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <details style={{ marginTop: '15px', display: 'none' }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  padding: '12px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}>
                  📋 View Response Data
                </summary>
                <pre style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  overflow: 'auto',
                  maxHeight: '400px',
                  color: 'var(--text-primary)'
                }}>
                  {JSON.stringify(
                    {
                      ...uploadStatus.data,
                      calculation_results: uploadStatus.data.calculation_results
                        ? { exercise: uploadStatus.data.calculation_results.exercise }
                        : uploadStatus.data.calculation_results,
                      form_analysis: uploadStatus.data.form_analysis
                        ? (() => {
                            const { knee_valgus, ...formAnalysisWithoutKneeValgus } = uploadStatus.data.form_analysis;
                            return formAnalysisWithoutKneeValgus;
                          })()
                        : uploadStatus.data.form_analysis
                    },
                    null,
                    2
                  )}
                </pre>
              </details>

              {videoFile && (
                <div style={{ marginTop: '15px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)', display: 'none' }}>
                  <p style={{ color: 'var(--text-primary)', margin: '4px 0' }}><strong>Video Selected:</strong> {videoFile.name}</p>
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0' }}><strong>Size:</strong> {(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  {videoFile.duration && (
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0' }}><strong>Duration:</strong> {Math.floor(videoFile.duration / 60)}:{(Math.floor(videoFile.duration % 60)).toString().padStart(2, '0')} ({videoFile.duration.toFixed(1)} seconds)</p>
                  )}
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0' }}><strong>Type:</strong> {videoFile.type}</p>
                  <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-primary)' }}>🔍 View Full videoFile Object</summary>
                    <pre style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      background: 'var(--bg-tertiary)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px',
                      overflow: 'auto',
                      maxHeight: '300px',
                      color: 'var(--text-primary)'
                    }}>
                      {JSON.stringify(videoFile, (key, value) => {
                        if (value instanceof File) {
                          return {
                            name: value.name,
                            size: value.size,
                            type: value.type,
                            lastModified: value.lastModified,
                            _type: 'File object (binary data not shown)'
                          };
                        }
                        return value;
                      }, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--score-poor)', fontWeight: 'bold' }}>❌ Error: {uploadStatus.error}</p>
              
              <details style={{ marginTop: '10px' }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  padding: '8px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--score-warning)',
                  color: 'var(--text-primary)'
                }}>
                  🔍 Full Error Details (Click to Expand - Debug Mode)
                </summary>
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '5px 0', fontSize: '12px', fontWeight: 'bold' }}>Error Message:</p>
                  <pre style={{ 
                    margin: '5px 0 10px 0', 
                    padding: '10px', 
                    fontSize: '11px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {uploadStatus.error}
                  </pre>
                  
                  <p style={{ margin: '10px 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>Full Error Detail Object:</p>
                  <pre style={{ 
                    margin: '5px 0', 
                    padding: '10px', 
                    fontSize: '11px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '400px'
                  }}>
                    {JSON.stringify(uploadStatus.errorDetail || {}, null, 2)}
                  </pre>
                  
                  {uploadStatus.rawError && (
                    <>
                      <p style={{ margin: '10px 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>Raw Backend Error Response:</p>
                      <pre style={{ 
                        margin: '5px 0 10px 0', 
                        padding: '10px', 
                        fontSize: '11px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '400px'
                      }}>
                        {JSON.stringify(uploadStatus.rawError, null, 2)}
                      </pre>
                    </>
                  )}
                  {(uploadStatus.status || uploadStatus.statusText) && (
                    <>
                      <p style={{ margin: '10px 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>HTTP Status:</p>
                      <p style={{ margin: '5px 0 10px 0', fontSize: '11px', color: '#666' }}>
                        Status: {uploadStatus.status} {uploadStatus.statusText}
                      </p>
                    </>
                  )}
                  <p style={{ margin: '10px 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>Full Upload Status Object:</p>
                  <pre style={{ 
                    margin: '5px 0', 
                    padding: '10px', 
                    fontSize: '11px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '400px'
                  }}>
                    {JSON.stringify(uploadStatus, (key, value) => {
                      if (value instanceof File) {
                        return {
                          name: value.name,
                          size: value.size,
                          type: value.type,
                          lastModified: value.lastModified,
                          _type: 'File object (binary data not shown)'
                        };
                      }
                      return value;
                    }, 2)}
                  </pre>
                </div>
              </details>
              
              {uploadStatus.errorDetail?.error === 'camera_angle_too_extreme' && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--score-poor)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    📹 Camera Angle Too Extreme
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    {uploadStatus.errorDetail.message}
                  </p>
                  {uploadStatus.errorDetail.angle_estimate && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Detected angle: {uploadStatus.errorDetail.angle_estimate}° (maximum: 15°, acceptable: ±10° from perpendicular)
                    </p>
                  )}
                  {uploadStatus.errorDetail.recommendation && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                      💡 {uploadStatus.errorDetail.recommendation}
                    </p>
                  )}
                </div>
              )}
              {uploadStatus.errorDetail?.error === 'insufficient_pose_detection' && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--score-poor)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    👤 Insufficient Pose Detection
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    {uploadStatus.errorDetail.message}
                  </p>
                  {uploadStatus.errorDetail.valid_frame_percentage !== undefined && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Valid frames: {(uploadStatus.errorDetail.valid_frame_percentage * 100).toFixed(0)}% (minimum required: 30%)
                    </p>
                  )}
                  {uploadStatus.errorDetail.recommendation && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                      💡 {uploadStatus.errorDetail.recommendation}
                    </p>
                  )}
                </div>
              )}
              {uploadStatus.errorDetail?.error === 'invalid_file_headers' && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--score-poor)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    🔒 Invalid File Headers
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    {uploadStatus.errorDetail.message}
                  </p>
                  {uploadStatus.errorDetail.detected_format && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Detected format: {uploadStatus.errorDetail.detected_format}
                    </p>
                  )}
                  {uploadStatus.errorDetail.recommendation && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                      💡 {uploadStatus.errorDetail.recommendation}
                    </p>
                  )}
                </div>
              )}
              {uploadStatus.errorDetail?.error === 'invalid_file_content' && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--score-poor)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    🎬 Invalid File Content
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    {uploadStatus.errorDetail.message}
                  </p>
                  {uploadStatus.errorDetail.frame_count !== undefined && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Frames detected: {uploadStatus.errorDetail.frame_count} | FPS: {uploadStatus.errorDetail.fps?.toFixed(2) || 'N/A'}
                    </p>
                  )}
                  {uploadStatus.errorDetail.warnings && uploadStatus.errorDetail.warnings.length > 0 && (
                    <div style={{ margin: '4px 0 0 0' }}>
                      {uploadStatus.errorDetail.warnings.map((warning, idx) => (
                        <p key={idx} style={{ margin: '2px 0', fontSize: '12px', color: '#856404' }}>
                          ⚠️ {warning}
                        </p>
                      ))}
                    </div>
                  )}
                  {uploadStatus.errorDetail.recommendation && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                      💡 {uploadStatus.errorDetail.recommendation}
                    </p>
                  )}
                </div>
              )}
              {uploadStatus.errorDetail?.error === 'rate_limit_exceeded' && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeeba',
                  borderRadius: '4px',
                  color: '#856404'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    ⏳ Too Many Uploads
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    {uploadStatus.errorDetail.message}
                  </p>
                  {uploadStatus.errorDetail.retry_after_seconds && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Retry after: {uploadStatus.errorDetail.retry_after_seconds} seconds
                    </p>
                  )}
                </div>
              )}
              {uploadStatus.errorDetail?.error === 'video_format_unsupported' && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--score-poor)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    🎥 Video Format Not Supported
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    {uploadStatus.errorDetail.message}
                  </p>
                  {uploadStatus.errorDetail.codec && uploadStatus.errorDetail.codec !== 'unknown' && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Detected codec: {uploadStatus.errorDetail.codec}
                    </p>
                  )}
                  {uploadStatus.errorDetail.recommendation && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                      💡 {uploadStatus.errorDetail.recommendation}
                    </p>
                  )}
                </div>
              )}
              {uploadStatus.errorDetail?.error === 'frame_extraction_failed' && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--score-poor)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    🎬 Frame Extraction Failed
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    {uploadStatus.errorDetail.message}
                  </p>
                  {uploadStatus.errorDetail.frame_count !== undefined && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Frames extracted: {uploadStatus.errorDetail.frame_count} | Valid: {uploadStatus.errorDetail.valid_frame_count || 0}
                    </p>
                  )}
                  {uploadStatus.errorDetail.recommendation && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                      💡 {uploadStatus.errorDetail.recommendation}
                    </p>
                  )}
                </div>
              )}
              {uploadStatus.errorDetail?.error === 'fps_validation_failed' && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--score-poor)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    ⏱️ FPS Validation Failed
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    {uploadStatus.errorDetail.message}
                  </p>
                  {uploadStatus.errorDetail.fps !== undefined && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Detected FPS: {uploadStatus.errorDetail.fps.toFixed(2)} fps
                    </p>
                  )}
                  {uploadStatus.errorDetail.warnings && uploadStatus.errorDetail.warnings.length > 0 && (
                    <div style={{ margin: '4px 0 0 0' }}>
                      {uploadStatus.errorDetail.warnings.map((warning, idx) => (
                        <p key={idx} style={{ margin: '2px 0', fontSize: '12px', color: '#856404' }}>
                          ⚠️ {warning}
                        </p>
                      ))}
                    </div>
                  )}
                  {uploadStatus.errorDetail.recommendation && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                      💡 {uploadStatus.errorDetail.recommendation}
                    </p>
                  )}
                </div>
              )}
              {uploadStatus.errorDetail?.error === 'video_duration_exceeded' && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--score-poor)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    ⏱️ Video Duration Exceeded
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    {uploadStatus.errorDetail.message}
                  </p>
                  {uploadStatus.errorDetail.duration_seconds !== undefined && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Video duration: {Math.floor(uploadStatus.errorDetail.duration_seconds / 60)}:{(Math.floor(uploadStatus.errorDetail.duration_seconds % 60)).toString().padStart(2, '0')} ({uploadStatus.errorDetail.duration_seconds.toFixed(1)} seconds)
                    </p>
                  )}
                  {uploadStatus.errorDetail.frame_count !== undefined && uploadStatus.errorDetail.fps !== undefined && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                      Frames: {uploadStatus.errorDetail.frame_count} | FPS: {uploadStatus.errorDetail.fps.toFixed(2)}
                    </p>
                  )}
                  {uploadStatus.errorDetail.recommendation && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                      💡 {uploadStatus.errorDetail.recommendation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadVideo;
