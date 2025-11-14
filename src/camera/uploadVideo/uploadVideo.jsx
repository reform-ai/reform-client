// Video upload handler for iPhone - React component
// Handles user input when upload button is clicked

import React, { useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function UploadVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [exerciseType, setExerciseType] = useState(null);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const videoObject = {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };
      setVideoFile(videoObject);
      console.log('✅ Video file selected and stored:', videoObject);
      console.log('📹 Full File object:', file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const renderAsymmetryPlots = (asymmetryPerFrame, frameCount) => {
    if (!asymmetryPerFrame) return null;

    const frameNumbers = Array.from({ length: frameCount || asymmetryPerFrame.torso_asymmetry?.length || 0 }, (_, i) => i + 1);
    
    const createChartOptions = (title) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          min: -10,
          max: 10,
          title: {
            display: true,
            text: 'Asymmetry (degrees)'
          },
          ticks: {
            stepSize: 2
          }
        },
        x: {
          title: {
            display: true,
            text: 'Frame Number'
          }
        }
      }
    });

    const createZeroLine = (length) => {
      return Array(length).fill(0);
    };

    const torsoData = {
      labels: frameNumbers,
      datasets: [
        {
          label: 'Torso Asymmetry (positive = right leaning, negative = left leaning)',
          data: asymmetryPerFrame.torso_asymmetry || [],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: 'Zero Line',
          data: createZeroLine(frameNumbers.length),
          borderColor: 'rgb(255, 0, 0)',
          backgroundColor: 'rgba(255, 0, 0, 0)',
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0
        }
      ]
    };

    const quadData = {
      labels: frameNumbers,
      datasets: [
        {
          label: 'Quad Asymmetry (positive = right forward, negative = left forward)',
          data: asymmetryPerFrame.quad_asymmetry || [],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        },
        {
          label: 'Zero Line',
          data: createZeroLine(frameNumbers.length),
          borderColor: 'rgb(255, 0, 0)',
          backgroundColor: 'rgba(255, 0, 0, 0)',
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0
        }
      ]
    };

    const ankleData = {
      labels: frameNumbers,
      datasets: [
        {
          label: 'Ankle Asymmetry (positive = right forward, negative = left forward)',
          data: asymmetryPerFrame.ankle_asymmetry || [],
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1
        },
        {
          label: 'Zero Line',
          data: createZeroLine(frameNumbers.length),
          borderColor: 'rgb(255, 0, 0)',
          backgroundColor: 'rgba(255, 0, 0, 0)',
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0
        }
      ]
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ height: '300px' }}>
          <h5 style={{ marginBottom: '10px', color: '#333' }}>Torso Asymmetry (positive = right leaning, negative = left leaning)</h5>
          <Line data={torsoData} options={createChartOptions('Torso')} />
        </div>
        <div style={{ height: '300px' }}>
          <h5 style={{ marginBottom: '10px', color: '#333' }}>Quad Asymmetry (positive = right forward, negative = left forward)</h5>
          <Line data={quadData} options={createChartOptions('Quad')} />
        </div>
        <div style={{ height: '300px' }}>
          <h5 style={{ marginBottom: '10px', color: '#333' }}>Ankle Asymmetry (positive = right forward, negative = left forward)</h5>
          <Line data={ankleData} options={createChartOptions('Ankle')} />
        </div>
      </div>
    );
  };

  const renderAnglePlots = (anglesPerFrame, frameCount) => {
    if (!anglesPerFrame) return null;

    const frameNumbers = Array.from({ length: frameCount || anglesPerFrame.torso_angle?.length || 0 }, (_, i) => i + 1);
    
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Angle (degrees)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Frame Number'
          }
        }
      }
    };

    const combinedData = {
      labels: frameNumbers,
      datasets: [
        {
          label: 'Torso Angle (0° = upright, 90° = bent forward)',
          data: anglesPerFrame.torso_angle || [],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: 'Quad Angle (0° = upright, 90° = knee forward/horizontal)',
          data: anglesPerFrame.quad_angle || [],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        },
        {
          label: 'Ankle Angle (90° = upright, &lt; 90° = knee forward)',
          data: anglesPerFrame.ankle_angle || [],
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1
        }
      ]
    };

    return (
      <div style={{ height: '400px' }}>
        <Line data={combinedData} options={chartOptions} />
      </div>
    );
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

      const response = await fetch('http://127.0.0.1:8000/upload-video', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus({ success: true, data });
        console.log('✅ Video uploaded successfully:', data);
      } else {
        // Handle camera angle rejection or other errors
        const errorMessage = data.detail?.message || data.detail?.error || data.message || 'Upload failed';
        const errorDetail = data.detail || {};
        setUploadStatus({ 
          success: false, 
          error: errorMessage,
          errorDetail: errorDetail
        });
        console.error('❌ Upload failed:', data);
      }
    } catch (error) {
      setUploadStatus({ success: false, error: error.message });
      console.error('❌ Error uploading video:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
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
            onClick={() => setExerciseType(2)}
            style={{
              padding: '10px 20px',
              backgroundColor: exerciseType === 2 ? '#4CAF50' : '#f0f0f0',
              color: exerciseType === 2 ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Bench
          </button>
          <button
            onClick={() => setExerciseType(3)}
            style={{
              padding: '10px 20px',
              backgroundColor: exerciseType === 3 ? '#4CAF50' : '#f0f0f0',
              color: exerciseType === 3 ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Deadlift
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
        <button
          onClick={handleSendToBackend}
          disabled={uploading}
          style={{ 
            padding: '10px 20px', 
            margin: '10px 0',
            backgroundColor: uploading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Uploading...' : 'Send to Backend'}
        </button>
      )}
      {videoFile && (
        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p><strong>Video Selected:</strong> {videoFile.name}</p>
          <p><strong>Size:</strong> {(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
                // Handle File object - show its properties but not the actual binary data
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
                  <p style={{ color: '#155724', fontWeight: 'bold' }}>✅ Upload Successful!</p>
                  
                  {/* Camera Angle Warning */}
                  {uploadStatus.data.camera_angle_info?.should_warn && (
                    <div style={{
                      marginTop: '15px',
                      padding: '12px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '4px',
                      color: '#856404'
                    }}>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>
                        ⚠️ Camera Angle Warning
                      </p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                        {uploadStatus.data.camera_angle_info.message}
                      </p>
                      {uploadStatus.data.camera_angle_info.angle_estimate && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontStyle: 'italic' }}>
                          Estimated angle: {uploadStatus.data.camera_angle_info.angle_estimate}°
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Expandable JSON output */}
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
                            : uploadStatus.data.calculation_results
                        },
                        null,
                        2
                      )}
                    </pre>
                  </details>
                  {uploadStatus.data.visualization_url && (
                    <div style={{ marginTop: '15px' }}>
                      <h4 style={{ marginBottom: '10px', color: '#155724' }}>Visualization Video:</h4>
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
                  )}
                  {uploadStatus.data.calculation_results?.angles_per_frame && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ marginBottom: '15px', color: '#155724' }}>Angle Analysis:</h4>
                      {renderAnglePlots(uploadStatus.data.calculation_results.angles_per_frame, uploadStatus.data.frame_count)}
                    </div>
                  )}
                  {uploadStatus.data.calculation_results?.asymmetry_per_frame && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ marginBottom: '15px', color: '#155724' }}>Asymmetry Analysis:</h4>
                      {renderAsymmetryPlots(uploadStatus.data.calculation_results.asymmetry_per_frame, uploadStatus.data.frame_count)}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ color: '#721c24', fontWeight: 'bold' }}>❌ Error: {uploadStatus.error}</p>
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
