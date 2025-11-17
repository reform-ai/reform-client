// FPPA Plot Component
// Reusable component for displaying FPPA (Frontal Plane Projection Angle) over time

import React from 'react';
import { Line } from 'react-chartjs-2';
import { getFPPAChartOptions, createFrameNumbers } from '../../utils/chartConfig';

function FPPAPlot({ fppaPerFrame }) {
  if (!fppaPerFrame || fppaPerFrame.length === 0) return null;

  const frameNumbers = createFrameNumbers(fppaPerFrame.length);
  const validData = fppaPerFrame.map((val) => val !== null ? val : null);
  
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

  return <Line data={chartData} options={getFPPAChartOptions()} />;
}

export default FPPAPlot;

