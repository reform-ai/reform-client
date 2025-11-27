import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAnalysis } from '../../utils/analysisApi';
import { normalizeAnalysisResults, getFpsFromAnalysis, getComponentScores as getComponentScoresFromNormalizer } from '../../utils/analysisDataNormalizer';
import { formatDateTime } from '../../utils/dateFormat';
import { getScoreColor } from '../../utils/scoreUtils';
import ScoreBreakdown from '../ScoreBreakdown';
import '../../styles/social/CreatePostModal.css';
import '../../../shared/styles/AnalysisSkeleton.css';

const AnalysisModal = ({ isOpen, onClose, analysisId }) => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedStates, setExpandedStates] = useState({
    torso_angle: false,
    quad_angle: false,
    asymmetry: false,
    torso_asymmetry: false,
    quad_asymmetry: false,
    ankle_asymmetry: false,
    rep_consistency: false,
    movement: false,
    knee_valgus: false
  });

  const fetchAnalysis = useCallback(async () => {
    if (!analysisId) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await getAnalysis(analysisId, navigate);
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(err.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, [analysisId, navigate]);

  useEffect(() => {
    if (isOpen && analysisId) {
      fetchAnalysis();
    } else {
      // Reset state when modal closes
      setAnalysis(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, analysisId, fetchAnalysis]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleExpanded = (key) => {
    setExpandedStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getAnalysisResults = () => {
    if (!analysis) return null;
    return normalizeAnalysisResults(analysis);
  };

  const getComponentScores = () => {
    if (!analysis) return {};
    return getComponentScoresFromNormalizer(analysis.form_analysis);
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/analyses?selected=${analysisId}`);
  };

  const analysisResults = getAnalysisResults();
  const componentScores = getComponentScores();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h2>Analysis Details</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Loading analysis...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--accent-orange)', marginBottom: '16px' }}>{error}</p>
              <button onClick={fetchAnalysis} className="btn btn-primary">
                Retry
              </button>
            </div>
          ) : analysis && analysisResults ? (
            <>
              {/* Header Info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: getScoreColor(analysis.score)
                    }}>
                      {analysis.score}/100
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase'
                    }}>
                      {analysis.exercise_name}
                    </div>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {formatDateTime(analysis.created_at)}
                  </p>
                </div>
                <button
                  onClick={handleViewFullDetails}
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  View Full Details →
                </button>
              </div>

              {/* Score Breakdown */}
              <ScoreBreakdown
                formAnalysis={analysisResults.form_analysis}
                componentScores={componentScores}
                calculationResults={analysisResults.calculation_results}
                squatPhases={analysisResults.squat_phases}
                frameCount={analysisResults.frame_count}
                expandedStates={expandedStates}
                onToggleExpanded={handleToggleExpanded}
                fps={getFpsFromAnalysis(analysisResults)}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;

