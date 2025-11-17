// Angle Plot Component
// Reusable component for displaying combined angle plots (Torso, Quad, Ankle)

import React from 'react';
import { Line } from 'react-chartjs-2';
import { getAngleChartOptions, createFrameNumbers } from '../../utils/chartConfig';

function AnglePlot({ anglesPerFrame, frameCount, squatPhases }) {
  if (!anglesPerFrame) return null;

  const frameNumbers = createFrameNumbers(frameCount || anglesPerFrame.torso_angle?.length || 0);
  
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
    labels: frameNumbers,
    datasets: datasets
  };

  return (
    <div style={{ height: '400px' }}>
      <Line data={combinedData} options={getAngleChartOptions(squatPhases)} />
    </div>
  );
}

export default AnglePlot;

