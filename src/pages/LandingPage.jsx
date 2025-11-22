import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalysisSkeleton from '../shared/templates/AnalysisSkeleton';
import PageHeader from '../shared/components/layout/PageHeader';
import PageContainer from '../shared/components/layout/PageContainer';
import LoginModal from '../shared/components/modals/LoginModal';
import ScoreBreakdown from '../shared/components/ScoreBreakdown';
import AnglePlot from '../shared/components/charts/AnglePlot';
import { isUserLoggedIn } from '../shared/utils/authStorage';
import { normalizeAnalysisResults, getFpsFromAnalysis, getComponentScores } from '../shared/utils/analysisDataNormalizer';

function LandingPage() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => isUserLoggedIn());
  const [analysisResults, setAnalysisResults] = useState(null);
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === '1') {
      setShowLoginModal(true);
      params.delete('login');
      const newSearch = params.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsVideoExpanded(isFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // Use React Router navigate instead of window.location to avoid full page reload
    // This ensures cookies are available when dashboard loads
    // Small delay to ensure cookies are processed by browser
    setTimeout(() => {
      navigate('/dashboard');
    }, 100);
  };

  const handleAnalysisComplete = (data) => {
    // Normalize the analysis data to ensure consistent format
    const normalized = normalizeAnalysisResults(data);
    setAnalysisResults(normalized);
  };

  const handleToggleExpanded = (key) => {
    setExpandedStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const handleExpandVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  // Use the normalizer's getComponentScores function for consistency
  const componentScores = getComponentScores(analysisResults?.form_analysis);

  return (
    <PageContainer className="App">
      <PageHeader onLoginClick={() => setShowLoginModal(true)} />

      <AnalysisSkeleton
        showNotes={false}
        syncCardHeights={true}
        headerTitle="Upload a Session"
        headerSubtitle={null}
        onSignInClick={() => setShowLoginModal(true)}
        onAnalysisComplete={handleAnalysisComplete}
      />

      {analysisResults?.form_analysis?.final_score && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--score-excellent)',
          borderRadius: '8px',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}>
          {analysisResults.camera_angle_info?.should_warn && (
            <details style={{ marginTop: '15px' }}>
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
              <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', marginTop: '5px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--text-primary)' }}>
                  {analysisResults.camera_angle_info.message}
                </p>
                {analysisResults.camera_angle_info.angle_estimate && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    Estimated angle: {analysisResults.camera_angle_info.angle_estimate}°
                  </p>
                )}
              </div>
            </details>
          )}

          <div className="analysis-layout" style={{ marginTop: '15px' }}>
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
                fps={getFpsFromAnalysis(analysisResults)}
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
                      fps={getFpsFromAnalysis(analysisResults)}
                      calculationResults={analysisResults.calculation_results}
                    />
                  </div>
                </details>
              )}
            </div>

            <div style={{
              flex: '1',
              minWidth: 0
            }}>
              {analysisResults.visualization_url && (
                <div className="video-container" style={{ 
                  position: 'relative',
                  width: '100%'
                }}>
                  <div style={{ 
                    position: 'relative',
                    width: '100%',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden'
                  }}>
                    <video 
                      ref={videoRef}
                      src={analysisResults.visualization_url}
                      controls
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '50vh',
                        display: 'block',
                        objectFit: 'contain'
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    {isVideoPlaying && (
                      <button
                        onClick={handleExpandVideo}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          padding: '8px 16px',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '14px',
                          fontFamily: 'Inter, sans-serif',
                          transition: 'all 0.2s ease',
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        }}
                      >
                        ⛶ Expand
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </PageContainer>
  );
}

export default LandingPage;
