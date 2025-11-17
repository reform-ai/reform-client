// Asymmetry Plot Component
// Reusable component for displaying asymmetry plots (Torso, Quad, Ankle)

import React from 'react';
import { Line } from 'react-chartjs-2';
import { getAsymmetryChartOptions, createZeroLine, createFrameNumbers } from '../../utils/chartConfig';

function AsymmetryPlot({ asymmetryData, frameCount, label, color, backgroundColor }) {
  if (!asymmetryData || asymmetryData.length === 0) return null;

  const frameNumbers = createFrameNumbers(frameCount || asymmetryData.length);
  const zeroLine = createZeroLine(frameNumbers.length);

  const chartData = {
    labels: frameNumbers,
    datasets: [
      {
        label: label,
        data: asymmetryData,
        borderColor: color || 'rgb(75, 192, 192)',
        backgroundColor: backgroundColor || 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'Zero Line',
        data: zeroLine,
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
      <Line data={chartData} options={getAsymmetryChartOptions()} />
    </div>
  );
}

export default AsymmetryPlot;

