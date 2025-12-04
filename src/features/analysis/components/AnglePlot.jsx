import React from 'react';
import { Line } from 'react-chartjs-2';
import { getAngleChartOptions, createFrameIndices } from '../../../shared/utils/chartConfig';
import { getVideoMetadata } from '../../../shared/utils/videoMetadata';
import { padMultipleArrays, calculateMinMaxFromArrays, calculateChartMinWidth } from '../../../shared/utils/plotDataUtils';

function AnglePlot({ anglesPerFrame, frameCount, squatPhases, fps = 30, calculationResults = null }) {
  if (!anglesPerFrame) return null;

  const metadata = getVideoMetadata({
    calculationResults,
    squatPhases,
    frameCount,
    fpsOverride: fps,
    dataArray: anglesPerFrame
  });
  const { fps: actualFps, totalFrames } = metadata;

  const frameLabels = createFrameIndices(totalFrames);
  const paddedAngles = padMultipleArrays(
    {
      torso: anglesPerFrame.torso_angle,
      quad: anglesPerFrame.quad_angle,
      ankle: anglesPerFrame.ankle_angle
    },
    totalFrames
  );

  const { min: yMin, max: yMax } = calculateMinMaxFromArrays(
    [paddedAngles.torso, paddedAngles.quad, paddedAngles.ankle],
    10,
    { min: 0, max: 100 }
  );

  const datasets = [
    {
      label: 'Torso Angle (0° = upright, 90° = bent forward)',
      data: paddedAngles.torso,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    },
    {
      label: 'Quad Angle (0° = upright, 90° = knee forward/horizontal)',
      data: paddedAngles.quad,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.1
    },
    {
      label: 'Ankle Angle (90° = upright, < 90° = knee forward)',
      data: paddedAngles.ankle,
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      tension: 0.1
    }
  ];

  const frameInterval = 60;
  const minWidth = calculateChartMinWidth(totalFrames);

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
        <Line data={{ labels: frameLabels, datasets }} options={getAngleChartOptions(squatPhases, actualFps, frameInterval, metadata)} />
      </div>
    </div>
  );
}

export default AnglePlot;

