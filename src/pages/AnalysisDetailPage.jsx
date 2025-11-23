import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAnalysis } from '../shared/utils/analysisApi';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { formatDateTime } from '../shared/utils/dateFormat';
import { normalizeAnalysisResults, getFpsFromAnalysis, getComponentScores as getComponentScoresFromNormalizer } from '../shared/utils/analysisDataNormalizer';
import { getScoreColor } from '../shared/utils/scoreUtils';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import ScoreBreakdown from '../shared/components/ScoreBreakdown';
import AnglePlot from '../shared/components/charts/AnglePlot';
import CreatePostModal from '../shared/components/modals/CreatePostModal';
import '../shared/styles/AnalysisSkeleton.css';
import './AnalysisDetailPage.css';

const AnalysisDetailPage = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [preloadedImageUrl, setPreloadedImageUrl] = useState(null);
  const [preloadedThumbnailUrl, setPreloadedThumbnailUrl] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
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
    setLoading(true);
    setError(null);

    try {
      const data = await getAnalysis(analysisId);
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(err.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useRequireAuth(navigate, fetchAnalysis);

  const handleToggleExpanded = (key) => {
    setExpandedStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Transform API response to match component expectations
  const getAnalysisResults = () => {
    if (!analysis) return null;
    // Normalize the analysis data to ensure consistent format
    return normalizeAnalysisResults(analysis);
  };

  const getComponentScores = () => {
    if (!analysis) return {};
    // Use the normalizer's getComponentScores function for consistency
    return getComponentScoresFromNormalizer(analysis.form_analysis);
  };

  const handleShareToFeed = async () => {
    if (!analysis) return;
    
    setIsGeneratingImage(true);
    try {
      // Generate share image
      const response = await authenticatedFetchJson(
        API_ENDPOINTS.ANALYSIS_GENERATE_SHARE_IMAGE(analysis.id),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        navigate
      );
      
      // Validate response
      if (!response || !response.image_url) {
        console.error('Invalid response from generate-share-image:', response);
        throw new Error('Invalid response from server: missing image_url');
      }
      
      console.log('Share image generated:', {
        image_url: response.image_url,
        thumbnail_url: response.thumbnail_url
      });
      
      // Set pre-loaded image URLs first
      setPreloadedImageUrl(response.image_url);
      setPreloadedThumbnailUrl(response.thumbnail_url || response.image_url);
      
      // Use setTimeout to ensure state is updated before opening modal
      // This ensures the useEffect in CreatePostModal receives the preloadedImageUrl
      setTimeout(() => {
        setShowCreatePost(true);
      }, 0);
    } catch (err) {
      console.error('Error generating share image:', err);
      alert('Failed to generate share image. Please try again.');
      setIsGeneratingImage(false);
    }
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    setPreloadedImageUrl(null);
    setPreloadedThumbnailUrl(null);
    navigate('/feed');
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div className="skeleton-shell">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--text-primary)' }}>Loading analysis...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !analysis) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div className="skeleton-shell">
          <div className="skeleton-card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-orange)', marginBottom: '16px' }}>
              {error || 'Analysis not found'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={fetchAnalysis} className="btn btn-primary">
                Retry
              </button>
              <Link to="/analyses" className="btn" style={{
                padding: '8px 16px',
                fontSize: '0.9rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                Back to History
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const analysisResults = getAnalysisResults();
  const componentScores = getComponentScores();

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <div style={{ marginBottom: '12px' }}>
              <Link 
                to="/analyses" 
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ← Back to Analysis History
              </Link>
            </div>
            <p className="skeleton-eyebrow">Analysis Details</p>
            <h1 className="skeleton-title">{analysis.exercise_name} Analysis</h1>
            <p className="skeleton-subtitle">
              {formatDateTime(analysis.created_at)}
            </p>
          </div>
          <div>
            <button
              onClick={handleShareToFeed}
              disabled={isGeneratingImage}
              className="btn btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isGeneratingImage ? (
                <>
                  <span className="btn-spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  📤 Share to Feed
                </>
              )}
            </button>
          </div>
        </header>

        <div className="skeleton-grid">
          {/* Analysis Info Card */}
          <article className="skeleton-card">
            <div style={{ padding: '24px' }}>
              <h2 style={{
                margin: '0 0 16px 0',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                Analysis Information
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Exercise
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {analysis.exercise_name}
                  </p>
                </div>

                <div>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Score
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: getScoreColor(analysis.score)
                  }}>
                    {analysis.score}/100
                  </p>
                </div>

                <div>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Date
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {formatDateTime(analysis.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Score Breakdown and Charts */}
          {analysisResults && (
            <article className="skeleton-card">
              <div style={{ padding: '24px' }}>
                {analysis.camera_angle_info?.should_warn && (
                  <details style={{ marginBottom: '20px' }}>
                    <summary style={{ 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      padding: '12px',
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--score-warning)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}>
                      ⚠️ Camera Angle Warning
                    </summary>
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: 'var(--card-bg)', 
                      borderRadius: '8px', 
                      marginTop: '5px', 
                      border: '1px solid var(--border-color)' 
                    }}>
                      <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {analysis.camera_angle_info.message}
                      </p>
                      {analysis.camera_angle_info.angle_estimate && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          Estimated angle: {analysis.camera_angle_info.angle_estimate}°
                        </p>
                      )}
                    </div>
                  </details>
                )}
                
                <div className="analysis-layout" style={{ marginTop: '0' }}>
                  <div className="form-score-container" style={{
                    flex: '1',
                    minWidth: 0
                  }}>
                    <ScoreBreakdown
                      formAnalysis={analysisResults.form_analysis}
                      componentScores={componentScores}
                      calculationResults={analysisResults.calculation_results}
                      squatPhases={analysisResults.squat_phases}
                      frameCount={analysisResults.frame_count}
                      expandedStates={expandedStates}
                      onToggleExpanded={handleToggleExpanded}
                      fps={analysisResults.calculation_results?.fps || analysisResults.fps || null}
                    />
                    
                    {analysisResults.calculation_results?.angles_per_frame && (
                      <details style={{ marginTop: '20px' }}>
                        <summary style={{ 
                          cursor: 'pointer', 
                          fontWeight: 'bold',
                          padding: '12px',
                          backgroundColor: 'var(--card-bg)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)'
                        }}>
                          📈 Angle Analysis Plots
                        </summary>
                        <div className="angle-analysis-plot-container" style={{ marginTop: '10px' }}>
                          <AnglePlot
                            anglesPerFrame={analysisResults.calculation_results.angles_per_frame}
                            frameCount={analysisResults.frame_count}
                            squatPhases={analysisResults.squat_phases}
                            fps={analysisResults.calculation_results?.fps || analysisResults.fps || 30}
                            calculationResults={analysisResults.calculation_results}
                          />
                        </div>
                      </details>
                    )}
                    
                    {/* Notes Section - Always visible, separate from Angle Analysis Plots */}
                    <div style={{
                      marginTop: '20px',
                      padding: '16px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px'
                    }}>
                      <h3 style={{
                        margin: '0 0 8px 0',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                      }}>
                        Notes
                      </h3>
                      <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        fontStyle: analysis.notes ? 'normal' : 'italic'
                      }}>
                        {analysis.notes || 'no notes'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>

      {showCreatePost && (
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => {
            setShowCreatePost(false);
            setPreloadedImageUrl(null);
            setPreloadedThumbnailUrl(null);
          }}
          onPostCreated={handlePostCreated}
          preloadedImageUrl={preloadedImageUrl}
          preloadedThumbnailUrl={preloadedThumbnailUrl}
          prefilledCaption={`Just completed ${analysis.exercise_name} analysis! Score: ${analysis.score}/100`}
        />
      )}
    </PageContainer>
  );
};

export default AnalysisDetailPage;

