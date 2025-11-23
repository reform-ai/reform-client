// Angle Plot Component
// Reusable component for displaying combined angle plots (Torso, Quad, Ankle)

import React from 'react';
import { Line } from 'react-chartjs-2';
import { getAngleChartOptions, createFrameIndices } from '../../utils/chartConfig';
import { getVideoMetadata } from '../../utils/videoMetadata';

function AnglePlot({ anglesPerFrame, frameCount, squatPhases, fps = 30, calculationResults = null }) {
  if (!anglesPerFrame) return null;

  // Get video metadata using centralized function
  const metadata = getVideoMetadata({
    calculationResults,
    squatPhases,
    frameCount,
    fpsOverride: fps,
    dataArray: anglesPerFrame
  });
  const { fps: actualFps, totalFrames } = metadata;

  const frameLabels = createFrameIndices(totalFrames);
  
  // Get min and max values for vertical line range
  const allAngles = [
    ...(anglesPerFrame.torso_angle || []).filter(a => a !== null),
    ...(anglesPerFrame.quad_angle || []).filter(a => a !== null),
    ...(anglesPerFrame.ankle_angle || []).filter(a => a !== null)
  ];
  const yMin = Math.min(...allAngles) - 10;
  const yMax = Math.max(...allAngles) + 10;

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
      label: 'Ankle Angle (90° = upright, < 90° = knee forward)',
      data: anglesPerFrame.ankle_angle || [],
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      tension: 0.1
    }
  ];

  const combinedData = {
    labels: frameLabels,
    datasets: datasets
  };

  const frameInterval = 60; // Configurable interval for tick display

  // Calculate minimum width based on number of frames (approximately 3px per frame for better readability)
  const minWidth = Math.max(totalFrames * 3, 1200);

  return (
    <div style={{ 
      height: '400px',
      overflowX: 'auto',
      overflowY: 'hidden',
      padding: '10px 0'
    }}>
      <div style={{ 
        minWidth: `${minWidth}px`,
        height: '100%',
        paddingRight: '20px',
        paddingLeft: '10px'
      }}>
        <Line data={combinedData} options={getAngleChartOptions(squatPhases, actualFps, frameInterval, metadata)} />
      </div>
    </div>
  );
}

export default AnglePlot;

