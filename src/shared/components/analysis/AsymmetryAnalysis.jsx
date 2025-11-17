// Asymmetry Analysis Component
// Reusable component for displaying asymmetry analysis results (Torso, Quad, Ankle)

import React from 'react';

const statusColors = {
  good: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
  warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
  poor: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
  error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
};

function AsymmetryAnalysis({ asymmetryAnalysis, title }) {
  if (!asymmetryAnalysis) return null;

  const colors = statusColors[asymmetryAnalysis.status] || statusColors.error;

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
          Status: <span style={{ textTransform: 'uppercase' }}>{asymmetryAnalysis.status}</span>
        </p>
        <p style={{ margin: '5px 0' }}>
          Score: {asymmetryAnalysis.score}/100
        </p>
        <p style={{ margin: '5px 0' }}>
          Maximum Asymmetry: {asymmetryAnalysis.max_asymmetry}°
        </p>
        <p style={{ margin: '5px 0' }}>
          Average Asymmetry: {asymmetryAnalysis.avg_asymmetry}°
        </p>
        <p style={{ margin: '5px 0' }}>
          Average Absolute Asymmetry: {asymmetryAnalysis.avg_abs_asymmetry}°
        </p>
      </div>
      <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
        {asymmetryAnalysis.message}
      </p>
    </div>
  );
}

export default AsymmetryAnalysis;

