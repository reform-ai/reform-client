// Per-Rep Plot Component
// Reusable component for displaying per-rep angle analysis

import React from 'react';
import { Line } from 'react-chartjs-2';
import { getPerRepChartOptions } from '../../utils/chartConfig';
import { getVideoMetadata } from '../../utils/videoMetadata';

function PerRepPlot({ rep, repNum, torsoAngles, quadAngles, ankleAngles, startFrame, endFrame, fps = 30, calculationResults = null }) {
  // Get video metadata using centralized function
  const metadata = getVideoMetadata({
    calculationResults,
    fpsOverride: fps
  });
  const { fps: actualFps } = metadata;

  // Create frame labels using absolute frame numbers (startFrame, startFrame+1, ..., endFrame)
  const frameLabels = Array.from({ length: endFrame - startFrame + 1 }, (_, i) => startFrame + i);
  
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

  const frameInterval = 60; // Configurable interval for tick display

  // Calculate minimum width based on rep length (approximately 3px per frame for better readability)
  const repLength = endFrame - startFrame + 1;
  const minWidth = Math.max(repLength * 3, 1200);

  return (
    <div key={repNum} style={{ marginBottom: '30px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--card-bg)' }}>
      <div style={{ 
        height: '300px',
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
          <Line 
            data={repData} 
            options={getPerRepChartOptions(
              `Rep ${repNum} (Frames ${startFrame + 1}-${endFrame + 1})`,
              yMin,
              yMax,
              actualFps,
              frameInterval,
              metadata
            )} 
          />
        </div>
      </div>
    </div>
  );
}

export default PerRepPlot;

