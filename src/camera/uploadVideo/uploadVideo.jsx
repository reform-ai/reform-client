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
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

function UploadVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [torsoAngleExpanded, setTorsoAngleExpanded] = useState(false);
  const [quadAngleExpanded, setQuadAngleExpanded] = useState(false);
  const [torsoAsymmetryExpanded, setTorsoAsymmetryExpanded] = useState(false);
  const [quadAsymmetryExpanded, setQuadAsymmetryExpanded] = useState(false);
  const [ankleAsymmetryExpanded, setAnkleAsymmetryExpanded] = useState(false);
  const [repConsistencyExpanded, setRepConsistencyExpanded] = useState(false);
  const [movementExpanded, setMovementExpanded] = useState(false);
  const [kneeValgusExpanded, setKneeValgusExpanded] = useState(false);
  const [exerciseType, setExerciseType] = useState(null);
  const fileInputRef = useRef(null);

  const detailCardStyle = {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e0e0e0'
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

  const renderTorsoAsymmetryPlot = (asymmetryPerFrame, frameCount) => {
    if (!asymmetryPerFrame || !asymmetryPerFrame.torso_asymmetry) return null;

    const frameNumbers = Array.from({ length: frameCount || asymmetryPerFrame.torso_asymmetry.length || 0 }, (_, i) => i + 1);
    const createZeroLine = (length) => Array(length).fill(0);

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: false }
      },
      scales: {
        y: {
          min: -10,
          max: 10,
          title: { display: true, text: 'Asymmetry (degrees)' },
          ticks: { stepSize: 2 }
        },
        x: { title: { display: true, text: 'Frame Number' } }
      }
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

    return (
      <div style={{ height: '300px', marginTop: '15px' }}>
        <Line data={torsoData} options={chartOptions} />
      </div>
    );
  };

  const renderQuadAsymmetryPlot = (asymmetryPerFrame, frameCount) => {
    if (!asymmetryPerFrame || !asymmetryPerFrame.quad_asymmetry) return null;

    const frameNumbers = Array.from({ length: frameCount || asymmetryPerFrame.quad_asymmetry.length || 0 }, (_, i) => i + 1);
    const createZeroLine = (length) => Array(length).fill(0);

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: false }
      },
      scales: {
        y: {
          min: -10,
          max: 10,
          title: { display: true, text: 'Asymmetry (degrees)' },
          ticks: { stepSize: 2 }
        },
        x: { title: { display: true, text: 'Frame Number' } }
      }
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

    return (
      <div style={{ height: '300px', marginTop: '15px' }}>
        <Line data={quadData} options={chartOptions} />
      </div>
    );
  };

  const renderAnkleAsymmetryPlot = (asymmetryPerFrame, frameCount) => {
    if (!asymmetryPerFrame || !asymmetryPerFrame.ankle_asymmetry) return null;

    const frameNumbers = Array.from({ length: frameCount || asymmetryPerFrame.ankle_asymmetry.length || 0 }, (_, i) => i + 1);
    const createZeroLine = (length) => Array(length).fill(0);

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: false }
      },
      scales: {
        y: {
          min: -10,
          max: 10,
          title: { display: true, text: 'Asymmetry (degrees)' },
          ticks: { stepSize: 2 }
        },
        x: { title: { display: true, text: 'Frame Number' } }
      }
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
      <div style={{ height: '300px', marginTop: '15px' }}>
        <Line data={ankleData} options={chartOptions} />
      </div>
    );
  };

  const renderAsymmetryPlots = (asymmetryPerFrame, frameCount) => {
    if (!asymmetryPerFrame) return null;

    const frameNumbers = Array.from({ length: frameCount || asymmetryPerFrame.quad_asymmetry?.length || 0 }, (_, i) => i + 1);
    
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

  const renderAnglePlots = (anglesPerFrame, frameCount, squatPhases) => {
    if (!anglesPerFrame) return null;

    const frameNumbers = Array.from({ length: frameCount || anglesPerFrame.torso_angle?.length || 0 }, (_, i) => i + 1);
    
    // Get min and max values for vertical line range
    const allAngles = [
      ...(anglesPerFrame.torso_angle || []).filter(a => a !== null),
      ...(anglesPerFrame.quad_angle || []).filter(a => a !== null),
      ...(anglesPerFrame.ankle_angle || []).filter(a => a !== null)
    ];
    const yMin = Math.min(...allAngles) - 10;
    const yMax = Math.max(...allAngles) + 10;
    
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

    const datasets = [
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
    ];

    // Add vertical lines for each squat rep using annotation plugin
    if (squatPhases && squatPhases.reps && squatPhases.reps.length > 0) {
      const annotations = {};
      squatPhases.reps.forEach((rep, index) => {
        const startFrame = rep.start_frame + 1; // Convert to 1-based
        const endFrame = rep.end_frame + 1;
        const repNum = index + 1;
        
        annotations[`startLine${repNum}`] = {
          type: 'line',
          xMin: startFrame,
          xMax: startFrame,
          borderColor: 'rgb(0, 255, 0)',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            display: true,
            content: `Rep ${repNum} Start`,
            position: 'start',
            backgroundColor: 'rgba(0, 255, 0, 0.7)',
            color: 'black',
            font: {
              size: 11
            }
          }
        };
        
        annotations[`endLine${repNum}`] = {
          type: 'line',
          xMin: endFrame,
          xMax: endFrame,
          borderColor: 'rgb(255, 0, 0)',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            display: true,
            content: `Rep ${repNum} End`,
            position: 'start',
            backgroundColor: 'rgba(255, 0, 0, 0.7)',
            color: 'black',
            font: {
              size: 11
            }
          }
        };
      });
      
      chartOptions.plugins.annotation = {
        annotations: annotations
      };
    }

    const combinedData = {
      labels: frameNumbers,
      datasets: datasets
    };

    return (
      <div style={{ height: '400px' }}>
        <Line data={combinedData} options={chartOptions} />
      </div>
    );
  };

  const renderAngleAnalysis = (analysis, title, angleKey) => {
    if (!analysis) return null;

    const statusColors = {
      good: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
      warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
      poor: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
      error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
    };

    const colors = statusColors[analysis.status] || statusColors.error;

    return (
      <div style={{
        marginTop: '15px',
        padding: '15px',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
        color: colors.text
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: colors.text }}>
          📊 {title}
        </h4>
        <div style={{ marginBottom: '10px' }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
            Status: <span style={{ textTransform: 'uppercase' }}>{analysis.status}</span>
          </p>
          <p style={{ margin: '5px 0' }}>
            Score: {analysis.score}/100
          </p>
          <p style={{ margin: '5px 0' }}>
            {angleKey === 'min_angle' ? 'Minimum Angle' : 'Max Angle'}: {analysis[angleKey]}°
          </p>
          <p style={{ margin: '5px 0' }}>
            Average Angle: {analysis.avg_angle}°
          </p>
          <p style={{ margin: '5px 0' }}>
            Angle Range: {analysis.angle_range}°
          </p>
        </div>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
          {analysis.message}
        </p>
      </div>
    );
  };

  const renderTorsoAngleAnalysis = (torsoAnalysis) => {
    return renderAngleAnalysis(torsoAnalysis, 'Torso Angle Analysis', 'max_angle');
  };

  const renderQuadAngleAnalysis = (quadAnalysis) => {
    return renderAngleAnalysis(quadAnalysis, 'Quad Angle Analysis (Squat Depth)', 'max_angle');
  };

  const renderAnkleAngleAnalysis = (ankleAnalysis) => {
    return renderAngleAnalysis(ankleAnalysis, 'Ankle Angle Analysis (Ankle Mobility)', 'min_angle');
  };

  const renderAsymmetryAnalysis = (asymmetryAnalysis, title) => {
    if (!asymmetryAnalysis) return null;

    const statusColors = {
      good: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
      warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
      poor: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
      error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
    };

    const colors = statusColors[asymmetryAnalysis.status] || statusColors.error;

    return (
      <div style={{
        marginTop: '15px',
        padding: '15px',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
        color: colors.text
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: colors.text }}>
          📊 {title}
        </h4>
        <div style={{ marginBottom: '10px' }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
            Status: <span style={{ textTransform: 'uppercase' }}>{asymmetryAnalysis.status}</span>
          </p>
          <p style={{ margin: '5px 0' }}>
            Score: {asymmetryAnalysis.score}/100
          </p>
          <p style={{ margin: '5px 0' }}>
            Maximum Asymmetry: {asymmetryAnalysis.max_asymmetry}°
          </p>
          <p style={{ margin: '5px 0' }}>
            Average Asymmetry: {asymmetryAnalysis.avg_asymmetry}°
          </p>
          <p style={{ margin: '5px 0' }}>
            Average Absolute Asymmetry: {asymmetryAnalysis.avg_abs_asymmetry}°
          </p>
        </div>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
          {asymmetryAnalysis.message}
        </p>
      </div>
    );
  };

  const renderKneeValgusAnalysis = (valgusAnalysis) => {
    if (!valgusAnalysis) return null;

    const statusColors = {
      good: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
      warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
      poor: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
      error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
    };

    const colors = statusColors[valgusAnalysis.status] || statusColors.error;

    return (
      <div style={{
        marginTop: '15px',
        padding: '15px',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
        color: colors.text
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: colors.text }}>
          🦵 Knee Valgus Analysis (Knee Cave)
        </h4>
        <div style={{ marginBottom: '10px' }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
            Status: <span style={{ textTransform: 'uppercase' }}>{valgusAnalysis.status}</span>
          </p>
          <p style={{ margin: '5px 0' }}>
            Score: {valgusAnalysis.score}/100
          </p>
          <p style={{ margin: '5px 0' }}>
            Maximum FPPA: {valgusAnalysis.max_fppa}° {valgusAnalysis.max_fppa < 180 ? '(valgus)' : valgusAnalysis.max_fppa > 180 ? '(varus)' : '(neutral)'}
          </p>
          <p style={{ margin: '5px 0' }}>
            Average FPPA: {valgusAnalysis.avg_fppa}°
          </p>
          <p style={{ margin: '5px 0' }}>
            FPPA Range: {valgusAnalysis.fppa_range}°
          </p>
          <p style={{ margin: '5px 0' }}>
            Maximum Deviation from 180°: {valgusAnalysis.max_deviation_from_180}°
          </p>
        </div>
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '4px'
        }}>
          <p style={{ margin: '5px 0', fontStyle: 'italic' }}>
            {valgusAnalysis.message}
          </p>
        </div>
        {valgusAnalysis.fppa_per_frame && (
          <div style={{ marginTop: '15px', height: '300px' }}>
            {renderFPPAPlot(valgusAnalysis.fppa_per_frame)}
          </div>
        )}
      </div>
    );
  };

  const renderFPPAPlot = (fppaPerFrame) => {
    if (!fppaPerFrame || fppaPerFrame.length === 0) return null;

    const frameNumbers = Array.from({ length: fppaPerFrame.length }, (_, i) => i + 1);
    const validData = fppaPerFrame.map((val, idx) => val !== null ? val : null);
    
    const chartData = {
      labels: frameNumbers,
      datasets: [
        {
          label: 'FPPA (180° = neutral)',
          data: validData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          pointRadius: 2
        },
        {
          label: '180° (neutral)',
          data: Array(fppaPerFrame.length).fill(180),
          borderColor: 'rgb(128, 128, 128)',
          backgroundColor: 'rgba(128, 128, 128, 0.1)',
          borderDash: [5, 5],
          pointRadius: 0
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'FPPA Over Time (Frontal Plane Projection Angle)'
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'FPPA (degrees)'
          },
          min: 140,
          max: 220
        },
        x: {
          title: {
            display: true,
            text: 'Frame Number'
          }
        }
      }
    };

    return <Line data={chartData} options={chartOptions} />;
  };

  const renderMovementAnalysis = (movementAnalysis) => {
    if (!movementAnalysis) return null;

    const statusColors = {
      good: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
      warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
      poor: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
      error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
    };

    const colors = statusColors[movementAnalysis.status] || statusColors.error;

    return (
      <div style={{
        marginTop: '15px',
        padding: '15px',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
        color: colors.text
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: colors.text }}>
          🏃 Movement Pattern Analysis (Glute vs Quad Dominance)
        </h4>
        <div style={{ marginBottom: '10px' }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
            Status: <span style={{ textTransform: 'uppercase' }}>{movementAnalysis.status}</span>
          </p>
          <p style={{ margin: '5px 0' }}>
            Score: {movementAnalysis.score}/100
          </p>
          <p style={{ margin: '5px 0' }}>
            Average Timing Difference: {movementAnalysis.avg_timing_diff_ms}ms
            {movementAnalysis.avg_timing_diff_ms > 0 && ' (Hip before knee - Hip-dominant)'}
            {movementAnalysis.avg_timing_diff_ms < 0 && ' (Knee before hip - Quad-dominant)'}
            {Math.abs(movementAnalysis.avg_timing_diff_ms) < 50 && ' (Mixed pattern)'}
          </p>
          {movementAnalysis.per_rep_diffs_ms && movementAnalysis.per_rep_diffs_ms.length > 0 && (
            <p style={{ margin: '5px 0' }}>
              Per-Rep Timing: {movementAnalysis.per_rep_diffs_ms.join('ms, ')}ms
            </p>
          )}
        </div>
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '4px'
        }}>
          <p style={{ margin: '5px 0', fontStyle: 'italic' }}>
            {movementAnalysis.message}
          </p>
        </div>
      </div>
    );
  };

  const renderRepConsistencyAnalysis = (consistencyAnalysis) => {
    if (!consistencyAnalysis) return null;

    const statusColors = {
      good: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
      warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
      poor: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
      error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
    };

    const colors = statusColors[consistencyAnalysis.status] || statusColors.error;

    const renderConsistencyMetric = (metric, title) => {
      if (!metric || metric.status === 'error') return null;
      const metricColors = statusColors[metric.status] || statusColors.error;
      return (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: metricColors.bg,
          border: `1px solid ${metricColors.border}`,
          borderRadius: '4px',
          color: metricColors.text
        }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
            {title}: <span style={{ textTransform: 'uppercase' }}>{metric.status}</span>
          </p>
          {metric.cv !== null && (
            <p style={{ margin: '5px 0' }}>
              Coefficient of Variation: {metric.cv}%
            </p>
          )}
          {metric.mean !== null && (
            <p style={{ margin: '5px 0' }}>
              Mean: {metric.mean}° | Std Dev: {metric.std}°
            </p>
          )}
          <p style={{ margin: '5px 0', fontSize: '13px' }}>
            {metric.message}
          </p>
        </div>
      );
    };

    return (
      <div style={{
        marginTop: '15px',
        padding: '15px',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
        color: colors.text
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: colors.text }}>
          📊 Rep-to-Rep Consistency Analysis ({consistencyAnalysis.rep_count} {consistencyAnalysis.rep_count === 1 ? 'Rep' : 'Reps'})
        </h4>
        <div style={{ marginBottom: '10px' }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
            Overall Status: <span style={{ textTransform: 'uppercase' }}>{consistencyAnalysis.status}</span>
          </p>
          <p style={{ margin: '5px 0' }}>
            Overall Score: {consistencyAnalysis.score}/100
          </p>
        </div>
        {renderConsistencyMetric(consistencyAnalysis.depth_consistency, 'Depth Consistency')}
        {renderConsistencyMetric(consistencyAnalysis.torso_consistency, 'Torso Angle Consistency')}
        {renderConsistencyMetric(consistencyAnalysis.asymmetry_consistency, 'Asymmetry Consistency')}
      </div>
    );
  };

  const renderPerRepAnalysis = (calculationResults, squatPhases) => {
    if (!squatPhases?.reps || squatPhases.reps.length === 0) return null;
    if (!calculationResults?.angles_per_frame) return null;

    const torsoAngles = calculationResults.angles_per_frame.torso_angle || [];
    const quadAngles = calculationResults.angles_per_frame.quad_angle || [];

    return (
      <details style={{ marginTop: '15px' }}>
        <summary style={{ 
          cursor: 'pointer', 
          fontWeight: 'bold',
          padding: '8px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          📊 Per-Rep Angle Analysis ({squatPhases.reps.length} {squatPhases.reps.length === 1 ? 'Rep' : 'Reps'})
        </summary>
        <div style={{ marginTop: '10px' }}>
          {squatPhases.reps.map((rep, index) => {
            const repNum = index + 1;
            const repFrames = [];
            for (let i = rep.start_frame; i <= rep.end_frame; i++) {
              repFrames.push(i);
            }
            
            const repTorsoAngles = repFrames.map(frame => 
              frame < torsoAngles.length ? torsoAngles[frame] : null
            );
            const repQuadAngles = repFrames.map(frame => 
              frame < quadAngles.length ? quadAngles[frame] : null
            );
            const ankleAngles = calculationResults.angles_per_frame.ankle_angle || [];
            const repAnkleAngles = repFrames.map(frame => 
              frame < ankleAngles.length ? ankleAngles[frame] : null
            );
            
            const frameLabels = repFrames.map((f, idx) => idx + 1);
            
            const allRepAngles = [
              ...repTorsoAngles.filter(a => a !== null),
              ...repQuadAngles.filter(a => a !== null),
              ...repAnkleAngles.filter(a => a !== null)
            ];
            const yMin = Math.min(...allRepAngles) - 5;
            const yMax = Math.max(...allRepAngles) + 5;

            const chartOptions = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: `Rep ${repNum} (Frames ${rep.start_frame + 1}-${rep.end_frame + 1})`,
                  font: { size: 14 }
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  min: yMin,
                  max: yMax,
                  title: {
                    display: true,
                    text: 'Angle (degrees)'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Frame in Rep'
                  }
                }
              }
            };

            const repData = {
              labels: frameLabels,
              datasets: [
                {
                  label: 'Torso Angle',
                  data: repTorsoAngles,
                  borderColor: 'rgb(75, 192, 192)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  tension: 0.1
                },
                {
                  label: 'Quad Angle',
                  data: repQuadAngles,
                  borderColor: 'rgb(255, 99, 132)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  tension: 0.1
                },
                {
                  label: 'Ankle Angle',
                  data: repAnkleAngles,
                  borderColor: 'rgb(54, 162, 235)',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  tension: 0.1
                }
              ]
            };

            return (
              <div key={index} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <div style={{ height: '300px' }}>
                  <Line data={repData} options={chartOptions} />
                </div>
              </div>
            );
          })}
        </div>
      </details>
    );
  };

  const scoreComponents = hasSuccessfulUpload ? [
    {
      key: 'torso_angle',
      label: 'Torso Angle',
      score: componentScores.torso_angle ?? null,
      available: !!uploadStatus.data.form_analysis?.torso_angle,
      expanded: torsoAngleExpanded,
      toggle: () => setTorsoAngleExpanded(!torsoAngleExpanded),
      details: uploadStatus.data.form_analysis?.torso_angle ? (
        <div style={detailCardStyle}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Torso Angle Analysis</h5>
          {renderTorsoAngleAnalysis(uploadStatus.data.form_analysis.torso_angle)}
        </div>
      ) : null
    },
    {
      key: 'quad_angle',
      label: 'Quad Angle',
      score: componentScores.quad_angle ?? null,
      available: !!uploadStatus.data.form_analysis?.quad_angle,
      expanded: quadAngleExpanded,
      toggle: () => setQuadAngleExpanded(!quadAngleExpanded),
      details: uploadStatus.data.form_analysis?.quad_angle ? (
        <div style={detailCardStyle}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Quad Angle Analysis</h5>
          {renderQuadAngleAnalysis(uploadStatus.data.form_analysis.quad_angle)}
        </div>
      ) : null
    },
    {
      key: 'glute_dominance',
      label: 'Movement (Glute Dominance)',
      score: componentScores.glute_dominance ?? null,
      available: !!uploadStatus.data.form_analysis?.glute_dominance,
      expanded: movementExpanded,
      toggle: () => setMovementExpanded(!movementExpanded),
      details: uploadStatus.data.form_analysis?.glute_dominance ? (
        <div style={detailCardStyle}>
          {renderMovementAnalysis(uploadStatus.data.form_analysis.glute_dominance)}
        </div>
      ) : null
    },
    {
      key: 'torso_asymmetry',
      label: 'Torso Asymmetry',
      score: componentScores.torso_asymmetry ?? null,
      available: !!uploadStatus.data.form_analysis?.torso_asymmetry,
      expanded: torsoAsymmetryExpanded,
      toggle: () => setTorsoAsymmetryExpanded(!torsoAsymmetryExpanded),
      details: uploadStatus.data.form_analysis?.torso_asymmetry ? (
        <div style={detailCardStyle}>
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Torso Asymmetry Analysis</h5>
            {renderAsymmetryAnalysis(uploadStatus.data.form_analysis.torso_asymmetry, 'Torso Asymmetry Analysis')}
          </div>
          {uploadStatus.data.calculation_results?.asymmetry_per_frame && (
            <div>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Torso Asymmetry Plot</h5>
              {renderTorsoAsymmetryPlot(uploadStatus.data.calculation_results.asymmetry_per_frame, uploadStatus.data.frame_count)}
            </div>
          )}
        </div>
      ) : null
    },
    {
      key: 'quad_asymmetry',
      label: 'Quad Asymmetry',
      score: componentScores.quad_asymmetry ?? null,
      available: !!uploadStatus.data.form_analysis?.quad_asymmetry,
      expanded: quadAsymmetryExpanded,
      toggle: () => setQuadAsymmetryExpanded(!quadAsymmetryExpanded),
      details: uploadStatus.data.form_analysis?.quad_asymmetry ? (
        <div style={detailCardStyle}>
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Quad Asymmetry Analysis</h5>
            {renderAsymmetryAnalysis(uploadStatus.data.form_analysis.quad_asymmetry, 'Quad Asymmetry Analysis')}
          </div>
          {uploadStatus.data.calculation_results?.asymmetry_per_frame && (
            <div>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Quad Asymmetry Plot</h5>
              {renderQuadAsymmetryPlot(uploadStatus.data.calculation_results.asymmetry_per_frame, uploadStatus.data.frame_count)}
            </div>
          )}
        </div>
      ) : null
    },
    {
      key: 'ankle_asymmetry',
      label: 'Ankle Asymmetry',
      score: componentScores.ankle_asymmetry ?? null,
      available: !!uploadStatus.data.form_analysis?.ankle_asymmetry,
      expanded: ankleAsymmetryExpanded,
      toggle: () => setAnkleAsymmetryExpanded(!ankleAsymmetryExpanded),
      details: uploadStatus.data.form_analysis?.ankle_asymmetry ? (
        <div style={detailCardStyle}>
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Ankle Asymmetry Analysis</h5>
            {renderAsymmetryAnalysis(uploadStatus.data.form_analysis.ankle_asymmetry, 'Ankle Asymmetry Analysis')}
          </div>
          {uploadStatus.data.calculation_results?.asymmetry_per_frame && (
            <div>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Ankle Asymmetry Plot</h5>
              {renderAnkleAsymmetryPlot(uploadStatus.data.calculation_results.asymmetry_per_frame, uploadStatus.data.frame_count)}
            </div>
          )}
        </div>
      ) : null
    },
    {
      key: 'rep_consistency',
      label: 'Rep Consistency',
      score: componentScores.rep_consistency ?? null,
      available: !!uploadStatus.data.form_analysis?.rep_consistency,
      expanded: repConsistencyExpanded,
      toggle: () => setRepConsistencyExpanded(!repConsistencyExpanded),
      details: uploadStatus.data.form_analysis?.rep_consistency ? (
        <div style={detailCardStyle}>
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Rep Consistency Analysis</h5>
            {renderRepConsistencyAnalysis(uploadStatus.data.form_analysis.rep_consistency)}
          </div>
          {uploadStatus.data.squat_phases?.reps && uploadStatus.data.calculation_results && (
            <div>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Per-Rep Angle Analysis</h5>
              {renderPerRepAnalysis(uploadStatus.data.calculation_results, uploadStatus.data.squat_phases)}
            </div>
          )}
        </div>
      ) : null
    }
  ] : [];

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

        xhr.open('POST', 'http://127.0.0.1:8000/upload-video');
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
                <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  border: '3px solid #007bff',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
                    Overall Form Score
                  </h2>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: uploadStatus.data.form_analysis.final_score.final_score >= 90 ? '#28a745' :
                           uploadStatus.data.form_analysis.final_score.final_score >= 75 ? '#ffc107' :
                           uploadStatus.data.form_analysis.final_score.final_score >= 60 ? '#fd7e14' : '#dc3545',
                    margin: '10px 0'
                  }}>
                    {uploadStatus.data.form_analysis.final_score.final_score}/100
                  </div>
                  <p style={{
                    margin: '5px 0',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#666'
                  }}>
                    {uploadStatus.data.form_analysis.final_score.grade}
                  </p>
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textAlign: 'left'
                  }}>
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Score Breakdown:</p>
                    <div style={{ margin: '2px 0' }}>
                      <span>Torso Angle: {uploadStatus.data.form_analysis.final_score.component_scores.torso_angle || 'N/A'}/100</span>
                      {uploadStatus.data.form_analysis?.torso_angle && (
                        <button
                          onClick={() => setTorsoAngleExpanded(!torsoAngleExpanded)}
                          style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {torsoAngleExpanded ? '−' : '+'}
                        </button>
                      )}
                    </div>
                    {torsoAngleExpanded && uploadStatus.data.form_analysis?.torso_angle && (
                      <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                        <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Torso Angle Analysis</h5>
                        {renderTorsoAngleAnalysis(uploadStatus.data.form_analysis.torso_angle)}
                      </div>
                    )}
                    <div style={{ margin: '2px 0' }}>
                      <span>Quad Angle: {uploadStatus.data.form_analysis.final_score.component_scores.quad_angle || 'N/A'}/100</span>
                      {uploadStatus.data.form_analysis?.quad_angle && (
                        <button
                          onClick={() => setQuadAngleExpanded(!quadAngleExpanded)}
                          style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {quadAngleExpanded ? '−' : '+'}
                        </button>
                      )}
                    </div>
                    {quadAngleExpanded && uploadStatus.data.form_analysis?.quad_angle && (
                      <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                        <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Quad Angle Analysis</h5>
                        {renderQuadAngleAnalysis(uploadStatus.data.form_analysis.quad_angle)}
                      </div>
                    )}
                    {uploadStatus.data.form_analysis?.glute_dominance && (
                      <div style={{ margin: '2px 0' }}>
                        <span>Movement: {uploadStatus.data.form_analysis.final_score.component_scores.glute_dominance || 'N/A'}/100</span>
                        <button
                          onClick={() => setMovementExpanded(!movementExpanded)}
                          style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {movementExpanded ? '−' : '+'}
                        </button>
                      </div>
                    )}
                    {movementExpanded && uploadStatus.data.form_analysis?.glute_dominance && (
                      <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                        {renderMovementAnalysis(uploadStatus.data.form_analysis.glute_dominance)}
                      </div>
                    )}
                    <div style={{ margin: '2px 0' }}>
                      <span>Torso Asymmetry: {uploadStatus.data.form_analysis.final_score.component_scores.torso_asymmetry || 'N/A'}/100</span>
                      {uploadStatus.data.form_analysis?.torso_asymmetry && (
                        <button
                          onClick={() => setTorsoAsymmetryExpanded(!torsoAsymmetryExpanded)}
                          style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {torsoAsymmetryExpanded ? '−' : '+'}
                        </button>
                      )}
                    </div>
                    {torsoAsymmetryExpanded && uploadStatus.data.form_analysis?.torso_asymmetry && (
                      <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                        <div style={{ marginBottom: '15px' }}>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Torso Asymmetry Analysis</h5>
                          {renderAsymmetryAnalysis(uploadStatus.data.form_analysis.torso_asymmetry, 'Torso Asymmetry Analysis')}
                        </div>
                        {uploadStatus.data.calculation_results?.asymmetry_per_frame && (
                          <div>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Torso Asymmetry Analysis Plot</h5>
                            {renderTorsoAsymmetryPlot(uploadStatus.data.calculation_results.asymmetry_per_frame, uploadStatus.data.frame_count)}
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ margin: '2px 0' }}>
                      <span>Quad Asymmetry: {uploadStatus.data.form_analysis.final_score.component_scores.quad_asymmetry || 'N/A'}/100</span>
                      {uploadStatus.data.form_analysis?.quad_asymmetry && (
                        <button
                          onClick={() => setQuadAsymmetryExpanded(!quadAsymmetryExpanded)}
                          style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {quadAsymmetryExpanded ? '−' : '+'}
                        </button>
                      )}
                    </div>
                    {quadAsymmetryExpanded && uploadStatus.data.form_analysis?.quad_asymmetry && (
                      <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                        <div style={{ marginBottom: '15px' }}>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Quad Asymmetry Analysis</h5>
                          {renderAsymmetryAnalysis(uploadStatus.data.form_analysis.quad_asymmetry, 'Quad Asymmetry Analysis')}
                        </div>
                        {uploadStatus.data.calculation_results?.asymmetry_per_frame && (
                          <div>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Quad Asymmetry Analysis Plot</h5>
                            {renderQuadAsymmetryPlot(uploadStatus.data.calculation_results.asymmetry_per_frame, uploadStatus.data.frame_count)}
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ margin: '2px 0' }}>
                      <span>Ankle Asymmetry: {uploadStatus.data.form_analysis.final_score.component_scores.ankle_asymmetry || 'N/A'}/100</span>
                      {uploadStatus.data.form_analysis?.ankle_asymmetry && (
                        <button
                          onClick={() => setAnkleAsymmetryExpanded(!ankleAsymmetryExpanded)}
                          style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {ankleAsymmetryExpanded ? '−' : '+'}
                        </button>
                      )}
                    </div>
                    {ankleAsymmetryExpanded && uploadStatus.data.form_analysis?.ankle_asymmetry && (
                      <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                        <div style={{ marginBottom: '15px' }}>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Ankle Asymmetry Analysis</h5>
                          {renderAsymmetryAnalysis(uploadStatus.data.form_analysis.ankle_asymmetry, 'Ankle Asymmetry Analysis')}
                        </div>
                        {uploadStatus.data.calculation_results?.asymmetry_per_frame && (
                          <div>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Ankle Asymmetry Analysis Plot</h5>
                            {renderAnkleAsymmetryPlot(uploadStatus.data.calculation_results.asymmetry_per_frame, uploadStatus.data.frame_count)}
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ margin: '2px 0' }}>
                      <span>Rep Consistency: {uploadStatus.data.form_analysis.final_score.component_scores.rep_consistency || 'N/A'}/100</span>
                      {uploadStatus.data.form_analysis?.rep_consistency && (
                        <button
                          onClick={() => setRepConsistencyExpanded(!repConsistencyExpanded)}
                          style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {repConsistencyExpanded ? '−' : '+'}
                        </button>
                      )}
                    </div>
                    {repConsistencyExpanded && uploadStatus.data.form_analysis?.rep_consistency && (
                      <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                        <div style={{ marginBottom: '15px' }}>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Rep-to-Rep Consistency Analysis</h5>
                          {renderRepConsistencyAnalysis(uploadStatus.data.form_analysis.rep_consistency)}
                        </div>
                        {uploadStatus.data.squat_phases?.reps && uploadStatus.data.calculation_results && (
                          <div>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Per-Rep Angle Analysis</h5>
                            {renderPerRepAnalysis(uploadStatus.data.calculation_results, uploadStatus.data.squat_phases)}
                          </div>
                        )}
                      </div>
                    )}
                    {uploadStatus.data.form_analysis?.knee_valgus && (
                      <div style={{ display: 'none' }}>
                        <div style={{ margin: '2px 0' }}>
                          <span>Knee Valgus</span>
                          <button
                            onClick={() => setKneeValgusExpanded(!kneeValgusExpanded)}
                            style={{
                              marginLeft: '8px',
                              padding: '2px 6px',
                              border: '1px solid #ccc',
                              borderRadius: '3px',
                              backgroundColor: '#fff',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            {kneeValgusExpanded ? '−' : '+'}
                          </button>
                        </div>
                        {kneeValgusExpanded && uploadStatus.data.form_analysis?.knee_valgus && (
                          <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                            {renderKneeValgusAnalysis(uploadStatus.data.form_analysis.knee_valgus)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
                    {renderAnglePlots(uploadStatus.data.calculation_results.angles_per_frame, uploadStatus.data.frame_count, uploadStatus.data.squat_phases)}
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
