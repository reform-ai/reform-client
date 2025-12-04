// Angle Analysis Component
// Reusable component for displaying angle analysis results (Torso, Quad, Ankle)

import React from 'react';

const statusColors = {
  good: { bg: 'var(--card-bg)', border: 'var(--score-excellent)', text: 'var(--text-primary)' },
  warning: { bg: 'var(--card-bg)', border: 'var(--score-warning)', text: 'var(--text-primary)' },
  poor: { bg: 'var(--card-bg)', border: 'var(--score-poor)', text: 'var(--text-primary)' },
  error: { bg: 'var(--card-bg)', border: 'var(--score-poor)', text: 'var(--text-primary)' }
};

function AngleAnalysis({ analysis, title, angleKey }) {
  if (!analysis) return null;

  const colors = statusColors[analysis.status] || statusColors.error;

  return (
    <div style={{
      marginTop: '15px',
      padding: '15px',
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '4px',
      color: colors.text
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: colors.text }}>
        📊 {title}
      </h4>
      <div style={{ marginBottom: '10px' }}>
        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
          Status: <span style={{ textTransform: 'uppercase' }}>{analysis.status}</span>
        </p>
        <p style={{ margin: '5px 0' }}>
          Score: {analysis.score}/100
        </p>
        <p style={{ margin: '5px 0' }}>
          {angleKey === 'min_angle' ? 'Minimum Angle' : 'Max Angle'}: {analysis[angleKey]}°
        </p>
        <p style={{ margin: '5px 0' }}>
          Average Angle: {analysis.avg_angle}°
        </p>
        <p style={{ margin: '5px 0' }}>
          Angle Range: {analysis.angle_range}°
        </p>
      </div>
      <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
        {analysis.message}
      </p>
    </div>
  );
}

export default AngleAnalysis;

