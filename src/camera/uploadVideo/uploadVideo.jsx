// Video upload handler for iPhone - React component
// Handles user input when upload button is clicked

import React, { useState, useRef } from 'react';
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
    torso_asymmetry: false,
    quad_asymmetry: false,
    ankle_asymmetry: false,
    rep_consistency: false,
    movement: false,
    knee_valgus: false
  });
  const [exerciseType, setExerciseType] = useState(null);
  const fileInputRef = useRef(null);

  const handleToggleExpanded = (key) => {
    setExpandedStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const hasSuccessfulUpload = uploadStatus?.success;
  const finalScoreData = hasSuccessfulUpload ? uploadStatus.data.form_analysis?.final_score : null;
  const componentScores = finalScoreData?.component_scores || {};

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
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

  // Render functions moved to shared components

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

        xhr.open('POST', API_ENDPOINTS.UPLOAD_VIDEO);
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
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Select Exercise Type:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setExerciseType(1)}
            style={{
              padding: '10px 20px',
              backgroundColor: exerciseType === 1 ? '#4CAF50' : '#f0f0f0',
              color: exerciseType === 1 ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Squat
          </button>
          <button
            onClick={() => {}}
            disabled
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              color: '#888',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'not-allowed',
              opacity: 0.6
            }}
          >
            Bench (Coming Soon)
          </button>
          <button
            onClick={() => {}}
            disabled
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              color: '#888',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'not-allowed',
              opacity: 0.6
            }}
          >
            Deadlift (Coming Soon)
          </button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        style={{ display: 'none' }}
      />
      <button
        onClick={handleUploadClick}
        style={{ padding: '10px 20px', margin: '10px 0', marginRight: '10px' }}
      >
        Select Video
      </button>
      {videoFile && (
        <div>
          <button
            onClick={handleSendToBackend}
            disabled={uploading || analyzing}
            style={{ 
              padding: '10px 20px', 
              margin: '10px 0',
              backgroundColor: (uploading || analyzing) ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (uploading || analyzing) ? 'not-allowed' : 'pointer'
            }}
          >
            {analyzing ? 'Analyzing...' : uploading ? 'Uploading...' : 'Send to Backend'}
          </button>
          {(uploading || analyzing) && (
            <div style={{ marginTop: '10px', width: '300px' }}>
              {uploading && !analyzing && (
                <>
                  <div style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: '#4CAF50',
                      transition: 'width 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {uploadProgress >= 10 && `${uploadProgress.toFixed(0)}%`}
                    </div>
                  </div>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                    Uploading: {uploadProgress.toFixed(1)}%
                  </p>
                </>
              )}
              {analyzing && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #2196F3',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid #f3f3f3',
                      borderTop: '3px solid #2196F3',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#1976D2', fontWeight: 'bold' }}>
                      Analyzing video...
                    </p>
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
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
          backgroundColor: uploadStatus.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${uploadStatus.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          {uploadStatus.success ? (
            <div>
              {/* Final Score - Always Visible */}
              {uploadStatus.data.form_analysis?.final_score && (
                <ScoreBreakdown
                  formAnalysis={uploadStatus.data.form_analysis}
                  componentScores={componentScores}
                  calculationResults={uploadStatus.data.calculation_results}
                  squatPhases={uploadStatus.data.squat_phases}
                  frameCount={uploadStatus.data.frame_count}
                  expandedStates={expandedStates}
                  onToggleExpanded={handleToggleExpanded}
                />
              )}

              {/* Camera Angle Warning */}
              {uploadStatus.data.camera_angle_info?.should_warn && (
                <details style={{ marginTop: '15px' }}>
                  <summary style={{ 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    color: '#856404'
                  }}>
                    ⚠️ Camera Angle Warning (Click to Expand)
                  </summary>
                  <div style={{ padding: '12px', backgroundColor: '#fff3cd', borderRadius: '4px', marginTop: '5px' }}>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                      {uploadStatus.data.camera_angle_info.message}
                    </p>
                    {uploadStatus.data.camera_angle_info.angle_estimate && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontStyle: 'italic' }}>
                        Estimated angle: {uploadStatus.data.camera_angle_info.angle_estimate}°
                      </p>
                    )}
                  </div>
                </details>
              )}

              {/* Visualization Video - Expandable */}
              {uploadStatus.data.visualization_url && (
                <details style={{ marginTop: '15px' }}>
                  <summary style={{ 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    🎥 Visualization Video (Click to Expand)
                  </summary>
                  <div style={{ marginTop: '10px' }}>
                    <video 
                      src={uploadStatus.data.visualization_url}
                      controls
                      style={{
                        width: '100%',
                        maxWidth: '800px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </details>
              )}

              {/* Angle Plots - Expandable */}
              {uploadStatus.data.calculation_results?.angles_per_frame && (
                <details style={{ marginTop: '15px' }}>
                  <summary style={{ 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    📈 Angle Analysis Plots (Click to Expand)
                  </summary>
                  <div style={{ marginTop: '10px' }}>
                    <AnglePlot
                      anglesPerFrame={uploadStatus.data.calculation_results.angles_per_frame}
                      frameCount={uploadStatus.data.frame_count}
                      squatPhases={uploadStatus.data.squat_phases}
                    />
                  </div>
                </details>
              )}

              {/* JSON Response Data - Expandable */}
              <details style={{ marginTop: '15px' }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}>
                  📋 View Response Data (Click to Expand)
                </summary>
                <pre style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  fontSize: '12px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '400px'
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

              {/* Video Selected - Moved to End */}
              {videoFile && (
                <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                  <p><strong>Video Selected:</strong> {videoFile.name}</p>
                  <p><strong>Size:</strong> {(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  {videoFile.duration && (
                    <p><strong>Duration:</strong> {Math.floor(videoFile.duration / 60)}:{(Math.floor(videoFile.duration % 60)).toString().padStart(2, '0')} ({videoFile.duration.toFixed(1)} seconds)</p>
                  )}
                  <p><strong>Type:</strong> {videoFile.type}</p>
                  <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🔍 View Full videoFile Object (Click to Expand)</summary>
                    <pre style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      background: '#f5f5f5', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '300px'
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
              <p style={{ color: '#721c24', fontWeight: 'bold' }}>❌ Error: {uploadStatus.error}</p>
              
              {/* Full Error Log - For Debugging */}
              <details style={{ marginTop: '10px' }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  padding: '8px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '4px',
                  border: '1px solid #ffc107',
                  color: '#856404'
                }}>
                  🔍 Full Error Details (Click to Expand - Debug Mode)
                </summary>
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '5px 0', fontSize: '12px', fontWeight: 'bold' }}>Error Message:</p>
                  <pre style={{ 
                    margin: '5px 0 10px 0', 
                    padding: '10px', 
                    fontSize: '11px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
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
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
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
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
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
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  color: '#721c24'
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
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  color: '#721c24'
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
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  color: '#721c24'
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
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  color: '#721c24'
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
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  color: '#721c24'
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
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  color: '#721c24'
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
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  color: '#721c24'
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
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  color: '#721c24'
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
