// Movement Analysis Component (Glute vs Quad Dominance)
// Reusable component for displaying movement pattern analysis

import React from 'react';

const statusColors = {
  good: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
  warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
  poor: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
  error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
};

function MovementAnalysis({ movementAnalysis }) {
  if (!movementAnalysis) return null;

  const colors = statusColors[movementAnalysis.status] || statusColors.error;

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
        🏃 Movement Pattern Analysis (Glute vs Quad Dominance)
      </h4>
      <div style={{ marginBottom: '10px' }}>
        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
          Status: <span style={{ textTransform: 'uppercase' }}>{movementAnalysis.status}</span>
        </p>
        <p style={{ margin: '5px 0' }}>
          Score: {movementAnalysis.score}/100
        </p>
        <p style={{ margin: '5px 0' }}>
          Average Timing Difference: {movementAnalysis.avg_timing_diff_ms}ms
          {movementAnalysis.avg_timing_diff_ms > 0 && ' (Hip before knee - Hip-dominant)'}
          {movementAnalysis.avg_timing_diff_ms < 0 && ' (Knee before hip - Quad-dominant)'}
          {Math.abs(movementAnalysis.avg_timing_diff_ms) < 50 && ' (Mixed pattern)'}
        </p>
        {movementAnalysis.per_rep_diffs_ms && movementAnalysis.per_rep_diffs_ms.length > 0 && (
          <p style={{ margin: '5px 0' }}>
            Per-Rep Timing: {movementAnalysis.per_rep_diffs_ms.join('ms, ')}ms
          </p>
        )}
      </div>
      <div style={{
        marginTop: '10px',
        padding: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '4px'
      }}>
        <p style={{ margin: '5px 0', fontStyle: 'italic' }}>
          {movementAnalysis.message}
        </p>
      </div>
    </div>
  );
}

export default MovementAnalysis;

