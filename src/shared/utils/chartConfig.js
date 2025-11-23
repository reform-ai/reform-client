// Chart.js configuration and utilities
// Shared across upload and livestream modes

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const TIME_TICK_TOLERANCE = 0.05;

/**
 * Calculate frame interval based on video duration and fps
 * Returns frame interval that corresponds to appropriate time intervals:
 * - < 15s: Every 2 seconds
 * - 15-30s: Every 5 seconds
 * - 30-60s: Every 10 seconds
 * - 60-120s: Every 20 seconds
 */
function calculateFrameInterval(duration, fps) {
  if (!duration || duration <= 0 || !fps || fps <= 0) {
    return 60; // Default fallback
  }
  
  const timeInterval = 
    duration < 15 ? 2 :      // Every 2 seconds
    duration < 30 ? 5 :       // Every 5 seconds
    duration < 60 ? 10 :      // Every 10 seconds
    20;                       // Every 20 seconds
  
  return Math.round(timeInterval * fps);
}

function createFrameTickFormatter(frameInterval = 60, fps = 30) {
  return function frameTickFormatter(value, index) {
    const frameNumber = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(frameNumber)) return '';
    
    if (frameNumber % frameInterval === 0) {
      return (frameNumber / fps).toString();
    }
    return '';
  };
}

function createAfterBuildTicks(frameInterval = 60, metadata = null, fps = null) {
  return function afterBuildTicks(scale) {
    const labels = scale.chart.data.labels || [];
    if (labels.length === 0) return;
    
    const actualFps = fps || (metadata && metadata.fps > 0 ? metadata.fps : 30);
    
    let totalFrames;
    if (metadata && metadata.totalFrames > 0) {
      totalFrames = metadata.totalFrames;
    } else {
      const lastLabel = labels[labels.length - 1];
      totalFrames = typeof lastLabel === 'number' ? lastLabel : parseFloat(lastLabel);
    }
    
    if (Number.isNaN(totalFrames) || totalFrames <= 0) return;
    
    let actualFrameInterval = frameInterval;
    if (metadata && metadata.duration > 0) {
      actualFrameInterval = calculateFrameInterval(metadata.duration, actualFps);
    }
    
    const newTicks = [];
    for (let frameNumber = 0; frameNumber <= totalFrames; frameNumber += actualFrameInterval) {
      if (labels.includes(frameNumber)) {
        newTicks.push({
          value: frameNumber,
          label: (frameNumber / actualFps).toString()
        });
      }
    }
    
    if (newTicks.length > 0) {
      scale.ticks = newTicks;
    }
  };
}

const getTimeAxisTicks = (fps = 30, frameInterval = 60, metadata = null) => {
  const actualFps = (metadata && metadata.fps > 0) ? metadata.fps : fps;
  
  let actualFrameInterval = frameInterval;
  if (metadata && metadata.duration > 0) {
    actualFrameInterval = calculateFrameInterval(metadata.duration, actualFps);
  }
  
  return {
    color: 'rgb(226, 232, 240)',
    callback: createFrameTickFormatter(actualFrameInterval, actualFps),
    maxRotation: 0,
    minRotation: 0,
    autoSkip: false,
    maxTicksLimit: 1000,
    afterBuildTicks: createAfterBuildTicks(actualFrameInterval, metadata, actualFps)
  };
};

export const getAsymmetryChartOptions = (fps = 30, frameInterval = 60, metadata = null) => ({
  responsive: true,
  maintainAspectRatio: false,
  backgroundColor: 'var(--bg-primary)',
  plugins: {
    legend: { 
      position: 'top',
      labels: {
        color: 'rgb(226, 232, 240)',
        usePointStyle: true,
        generateLabels: (chart) => {
          const datasets = chart.data.datasets;
          return datasets.map((dataset, i) => {
            const label = dataset.label || `Dataset ${i}`;
            const borderColor = dataset.borderColor || 'rgb(0, 0, 0)';
            const isZeroLine = label === 'Zero Line';
            
            return {
              text: label,
              fillStyle: isZeroLine ? 'transparent' : (dataset.backgroundColor || borderColor),
              strokeStyle: borderColor,
              lineDash: isZeroLine ? [5, 5] : [],
              fontColor: 'rgb(226, 232, 240)',
              hidden: !chart.isDatasetVisible(i),
              index: i,
              datasetIndex: i,
              pointStyle: 'line'
            };
          });
        }
      }
    },
    title: { display: false }
  },
  scales: {
    y: {
      min: -10,
      max: 10,
      title: { 
        display: true, 
        text: 'Asymmetry (degrees)',
        color: 'rgb(226, 232, 240)'
      },
      ticks: { 
        stepSize: 2,
        color: 'rgb(226, 232, 240)'
      },
      grid: {
        color: 'rgba(226, 232, 240, 0.1)'
      }
    },
    x: { 
      title: { 
        display: true, 
        text: 'Time (s)',
        color: 'rgb(226, 232, 240)'
      },
      ticks: getTimeAxisTicks(fps, frameInterval, metadata),
      grid: {
        display: false
      }
    }
  }
});

export const getAngleChartOptions = (squatPhases = null, fps = 30, frameInterval = 60, metadata = null) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: 'var(--bg-primary)',
    plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgb(226, 232, 240)',
        usePointStyle: true,
        pointStyle: 'line'
      }
    },
    title: {
      display: false,
    },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Angle (degrees)',
          color: 'rgb(226, 232, 240)'
        },
        ticks: {
          color: 'rgb(226, 232, 240)'
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time (s)',
          color: 'rgb(226, 232, 240)'
        },
        ticks: getTimeAxisTicks(fps, frameInterval, metadata),
        grid: {
          display: false
        }
      }
    }
  };

  // With CategoryScale, Chart.js uses label indices for positioning, so we use frame indices directly
  if (squatPhases && squatPhases.reps && squatPhases.reps.length > 0) {
    const annotations = {};
    squatPhases.reps.forEach((rep, index) => {
      const startFrame = rep.start_frame;
      const endFrame = rep.end_frame;
      const repNum = index + 1;
      
      annotations[`startLine${repNum}`] = {
        type: 'line',
        xMin: startFrame,
        xMax: startFrame,
        borderColor: 'rgb(0, 255, 0)',
        borderWidth: 2,
        borderDash: [5, 5],
        label: {
          display: true,
          content: `R${repNum} Start`,
          position: 'start',
          backgroundColor: 'rgba(0, 255, 0, 0.7)',
          color: 'black',
          font: {
            size: 11
          }
        }
      };
      
      annotations[`endLine${repNum}`] = {
        type: 'line',
        xMin: endFrame,
        xMax: endFrame,
        borderColor: 'rgb(255, 0, 0)',
        borderWidth: 2,
        borderDash: [5, 5],
        label: {
          display: true,
          content: `R${repNum} End`,
          position: 'start',
          backgroundColor: 'rgba(255, 0, 0, 0.7)',
          color: 'black',
          font: {
            size: 11
          }
        }
      };
    });
    
    options.plugins.annotation = {
      annotations: annotations
    };
  }

  return options;
};

export const getFPPAChartOptions = (fps = 30, frameInterval = 60, metadata = null) => ({
  responsive: true,
  maintainAspectRatio: false,
  backgroundColor: 'var(--bg-primary)',
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgb(226, 232, 240)',
        usePointStyle: true,
        pointStyle: 'line'
      }
    },
    title: {
      display: true,
      text: 'FPPA Over Time (Frontal Plane Projection Angle)',
      color: 'rgb(226, 232, 240)'
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: 'FPPA (degrees)',
        color: 'rgb(226, 232, 240)'
      },
      min: 140,
      max: 220,
      ticks: {
        color: 'rgb(226, 232, 240)'
      },
      grid: {
        color: 'rgba(226, 232, 240, 0.1)'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Time (s)',
        color: 'rgb(226, 232, 240)'
      },
      ticks: getTimeAxisTicks(fps, frameInterval, metadata),
      grid: {
        display: false
      }
    }
  }
});

export const getPerRepChartOptions = (title, yMin, yMax, fps = 30, frameInterval = 60, metadata = null) => ({
  responsive: true,
  maintainAspectRatio: false,
  backgroundColor: 'var(--bg-primary)',
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgb(226, 232, 240)',
        usePointStyle: true,
        pointStyle: 'line'
      }
    },
    title: {
      display: true,
      text: title,
      font: { size: 14 },
      color: 'rgb(226, 232, 240)'
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      min: yMin,
      max: yMax,
      title: {
        display: true,
        text: 'Angle (degrees)',
        color: 'rgb(226, 232, 240)'
      },
      ticks: {
        color: 'rgb(226, 232, 240)'
      },
      grid: {
        color: 'rgba(226, 232, 240, 0.1)'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Time (s)',
        color: 'rgb(226, 232, 240)'
      },
      ticks: getTimeAxisTicks(fps, frameInterval, metadata),
      grid: {
        display: false
      }
    }
  }
});

export const createZeroLine = (length) => Array(length).fill(0);
export const createFrameNumbers = (length) => Array.from({ length }, (_, i) => i + 1);
export const createFrameIndices = (length) => Array.from({ length }, (_, i) => i);

export const createTimeLabels = (length, fps = 30) => {
  const safeFps = fps && fps > 0 ? fps : 30;
  if (!length || length <= 0) return [];
  return Array.from({ length }, (_, i) =>
    Number((i / safeFps).toFixed(2))
  );
};

