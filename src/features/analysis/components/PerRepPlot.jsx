import React from 'react';
import { Line } from 'react-chartjs-2';
import { getPerRepChartOptions } from '../../../shared/utils/chartConfig';
import { getVideoMetadata } from '../../../shared/utils/videoMetadata';
import { calculateMinMaxFromArrays, calculateChartMinWidth } from '../../../shared/utils/plotDataUtils';

function PerRepPlot({ rep, repNum, torsoAngles, quadAngles, ankleAngles, startFrame, endFrame, fps = 30, calculationResults = null }) {
  const metadata = getVideoMetadata({
    calculationResults,
    fpsOverride: fps
  });
  const { fps: actualFps } = metadata;

  const frameLabels = Array.from({ length: endFrame - startFrame + 1 }, (_, i) => startFrame + i);
  const { min: yMin, max: yMax } = calculateMinMaxFromArrays(
    [torsoAngles, quadAngles, ankleAngles],
    5,
    { min: 0, max: 100 }
  );

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

  const frameInterval = 60;
  const repLength = endFrame - startFrame + 1;
  const minWidth = calculateChartMinWidth(repLength);

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

