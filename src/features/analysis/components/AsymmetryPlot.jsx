import React from 'react';
import { Line } from 'react-chartjs-2';
import { getAsymmetryChartOptions, createZeroLine, createFrameIndices } from '../../../shared/utils/chartConfig';
import { getVideoMetadata } from '../../../shared/utils/videoMetadata';
import { padArrayToLength, calculateChartMinWidth } from '../../../shared/utils/plotDataUtils';

function AsymmetryPlot({ asymmetryData, frameCount, label, color, backgroundColor, fps = 30, calculationResults = null }) {
  if (!asymmetryData || asymmetryData.length === 0) return null;

  const metadata = getVideoMetadata({
    calculationResults,
    frameCount,
    fpsOverride: fps,
    dataArray: asymmetryData
  });
  const { fps: actualFps, totalFrames } = metadata;

  const frameLabels = createFrameIndices(totalFrames);
  const zeroLine = createZeroLine(frameLabels.length);
  const paddedAsymmetryData = padArrayToLength(asymmetryData, totalFrames);

  const chartData = {
    labels: frameLabels,
    datasets: [
      {
        label: label,
        data: paddedAsymmetryData,
        borderColor: color || 'rgb(75, 192, 192)',
        backgroundColor: backgroundColor || 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'Zero Line',
        data: zeroLine,
        borderColor: 'rgb(255, 0, 0)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
        fill: false,
        spanGaps: false
      }
    ]
  };

  const frameInterval = 60;
  const minWidth = calculateChartMinWidth(totalFrames);

  return (
    <div style={{ 
      height: '300px', 
      marginTop: '15px',
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
        <Line data={chartData} options={getAsymmetryChartOptions(actualFps, frameInterval, metadata)} />
      </div>
    </div>
  );
}

export default AsymmetryPlot;

