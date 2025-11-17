// Knee Valgus Analysis Component
// Reusable component for displaying knee valgus (FPPA) analysis

import React from 'react';
import FPPAPlot from '../charts/FPPAPlot';

const statusColors = {
  good: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
  warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
  poor: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
  error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
};

function KneeValgusAnalysis({ valgusAnalysis }) {
  if (!valgusAnalysis) return null;

  const colors = statusColors[valgusAnalysis.status] || statusColors.error;

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
        🦵 Knee Valgus Analysis (Knee Cave)
      </h4>
      <div style={{ marginBottom: '10px' }}>
        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
          Status: <span style={{ textTransform: 'uppercase' }}>{valgusAnalysis.status}</span>
        </p>
        <p style={{ margin: '5px 0' }}>
          Score: {valgusAnalysis.score}/100
        </p>
        <p style={{ margin: '5px 0' }}>
          Maximum FPPA: {valgusAnalysis.max_fppa}° {valgusAnalysis.max_fppa < 180 ? '(valgus)' : valgusAnalysis.max_fppa > 180 ? '(varus)' : '(neutral)'}
        </p>
        <p style={{ margin: '5px 0' }}>
          Average FPPA: {valgusAnalysis.avg_fppa}°
        </p>
        <p style={{ margin: '5px 0' }}>
          FPPA Range: {valgusAnalysis.fppa_range}°
        </p>
        <p style={{ margin: '5px 0' }}>
          Maximum Deviation from 180°: {valgusAnalysis.max_deviation_from_180}°
        </p>
      </div>
      <div style={{
        marginTop: '10px',
        padding: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '4px'
      }}>
        <p style={{ margin: '5px 0', fontStyle: 'italic' }}>
          {valgusAnalysis.message}
        </p>
      </div>
      {valgusAnalysis.fppa_per_frame && (
        <div style={{ marginTop: '15px', height: '300px' }}>
          <FPPAPlot fppaPerFrame={valgusAnalysis.fppa_per_frame} />
        </div>
      )}
    </div>
  );
}

export default KneeValgusAnalysis;

