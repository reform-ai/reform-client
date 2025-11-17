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

// Common chart options
export const getAsymmetryChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: false }
  },
  scales: {
    y: {
      min: -10,
      max: 10,
      title: { display: true, text: 'Asymmetry (degrees)' },
      ticks: { stepSize: 2 }
    },
    x: { title: { display: true, text: 'Frame Number' } }
  }
});

export const getAngleChartOptions = (squatPhases = null) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
          text: 'Angle (degrees)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Frame Number'
        }
      }
    }
  };

  // Add vertical lines for each squat rep using annotation plugin
  if (squatPhases && squatPhases.reps && squatPhases.reps.length > 0) {
    const annotations = {};
    squatPhases.reps.forEach((rep, index) => {
      const startFrame = rep.start_frame + 1; // Convert to 1-based
      const endFrame = rep.end_frame + 1;
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
          content: `Rep ${repNum} Start`,
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
          content: `Rep ${repNum} End`,
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

export const getFPPAChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'FPPA Over Time (Frontal Plane Projection Angle)'
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: 'FPPA (degrees)'
      },
      min: 140,
      max: 220
    },
    x: {
      title: {
        display: true,
        text: 'Frame Number'
      }
    }
  }
});

export const getPerRepChartOptions = (title, yMin, yMax) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: title,
      font: { size: 14 }
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      min: yMin,
      max: yMax,
      title: {
        display: true,
        text: 'Angle (degrees)'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Frame in Rep'
      }
    }
  }
});

// Helper to create zero line dataset
export const createZeroLine = (length) => Array(length).fill(0);

// Helper to create frame numbers array
export const createFrameNumbers = (length) => Array.from({ length }, (_, i) => i + 1);

