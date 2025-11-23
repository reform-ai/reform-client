// Rep Consistency Analysis Component
// Reusable component for displaying rep-to-rep consistency analysis

import React from 'react';

const statusColors = {
  good: { bg: 'var(--card-bg)', border: 'var(--score-excellent)', text: 'var(--text-primary)' },
  warning: { bg: 'var(--card-bg)', border: 'var(--score-warning)', text: 'var(--text-primary)' },
  poor: { bg: 'var(--card-bg)', border: 'var(--score-poor)', text: 'var(--text-primary)' },
  error: { bg: 'var(--card-bg)', border: 'var(--score-poor)', text: 'var(--text-primary)' }
};

function RepConsistencyAnalysis({ consistencyAnalysis }) {
  if (!consistencyAnalysis) return null;

  const colors = statusColors[consistencyAnalysis.status] || statusColors.error;

  const renderConsistencyMetric = (metric, title) => {
    if (!metric || metric.status === 'error') return null;
    const metricColors = statusColors[metric.status] || statusColors.error;
    return (
      <div style={{
        marginTop: '10px',
        padding: '10px',
        backgroundColor: metricColors.bg,
        border: `1px solid ${metricColors.border}`,
        borderRadius: '4px',
        color: metricColors.text
      }}>
        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
          {title}: <span style={{ textTransform: 'uppercase' }}>{metric.status}</span>
        </p>
        {metric.cv !== null && (
          <p style={{ margin: '5px 0' }}>
            Coefficient of Variation: {metric.cv}%
          </p>
        )}
        {metric.mean !== null && (
          <p style={{ margin: '5px 0' }}>
            Mean: {metric.mean}° | Std Dev: {metric.std}°
          </p>
        )}
        <p style={{ margin: '5px 0', fontSize: '13px' }}>
          {metric.message}
        </p>
      </div>
    );
  };

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
        📊 Rep-to-Rep Consistency Analysis ({consistencyAnalysis.rep_count} {consistencyAnalysis.rep_count === 1 ? 'Rep' : 'Reps'})
      </h4>
      <div style={{ marginBottom: '10px' }}>
        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
          Overall Status: <span style={{ textTransform: 'uppercase' }}>{consistencyAnalysis.status}</span>
        </p>
        <p style={{ margin: '5px 0' }}>
          Overall Score: {consistencyAnalysis.score}/100
        </p>
      </div>
      {renderConsistencyMetric(consistencyAnalysis.depth_consistency, 'Depth Consistency')}
      {renderConsistencyMetric(consistencyAnalysis.torso_consistency, 'Torso Angle Consistency')}
      {renderConsistencyMetric(consistencyAnalysis.asymmetry_consistency, 'Asymmetry Consistency')}
    </div>
  );
}

export default RepConsistencyAnalysis;

