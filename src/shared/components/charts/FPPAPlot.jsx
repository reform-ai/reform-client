// FPPA Plot Component
// Reusable component for displaying FPPA (Frontal Plane Projection Angle) over time

import React from 'react';
import { Line } from 'react-chartjs-2';
import { getFPPAChartOptions, createFrameIndices } from '../../utils/chartConfig';
import { getVideoMetadata } from '../../utils/videoMetadata';

function FPPAPlot({ fppaPerFrame, fps = 30, calculationResults = null }) {
  if (!fppaPerFrame || fppaPerFrame.length === 0) return null;

  // Get video metadata using centralized function
  const metadata = getVideoMetadata({
    calculationResults,
    fpsOverride: fps,
    dataArray: fppaPerFrame
  });
  const { fps: actualFps, totalFrames } = metadata;

  const frameLabels = createFrameIndices(totalFrames);
  const validData = fppaPerFrame.map((val) => val !== null ? val : null);
  
  const chartData = {
    labels: frameLabels,
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

  const frameInterval = 60; // Configurable interval for tick display

  return <Line data={chartData} options={getFPPAChartOptions(actualFps, frameInterval, metadata)} />;
}

export default FPPAPlot;

