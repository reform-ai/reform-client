// Per-Rep Plot Component
// Reusable component for displaying per-rep angle analysis

import React from 'react';
import { Line } from 'react-chartjs-2';
import { getPerRepChartOptions, createFrameNumbers } from '../../utils/chartConfig';

function PerRepPlot({ rep, repNum, torsoAngles, quadAngles, ankleAngles, startFrame, endFrame }) {
  const frameLabels = createFrameNumbers(endFrame - startFrame + 1);
  
  const allRepAngles = [
    ...torsoAngles.filter(a => a !== null),
    ...quadAngles.filter(a => a !== null),
    ...ankleAngles.filter(a => a !== null)
  ];
  const yMin = Math.min(...allRepAngles) - 5;
  const yMax = Math.max(...allRepAngles) + 5;

  const repData = {
    labels: frameLabels,
    datasets: [
      {
        label: 'Torso Angle',
        data: torsoAngles,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'Quad Angle',
        data: quadAngles,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      },
      {
        label: 'Ankle Angle',
        data: ankleAngles,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1
      }
    ]
  };

  return (
    <div key={repNum} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <div style={{ height: '300px' }}>
        <Line 
          data={repData} 
          options={getPerRepChartOptions(
            `Rep ${repNum} (Frames ${startFrame + 1}-${endFrame + 1})`,
            yMin,
            yMax
          )} 
        />
      </div>
    </div>
  );
}

export default PerRepPlot;

