import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import CreateXPostModal from '../shared/components/modals/CreateXPostModal';
import '../shared/styles/AnalysisSkeleton.css';
import './AnalysisDetailPage.css';

const AnalysisDetailPage = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateXPost, setShowCreateXPost] = useState(false);
  const [preloadedImageUrl, setPreloadedImageUrl] = useState(null);
  const [preloadedThumbnailUrl, setPreloadedThumbnailUrl] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [xStatus, setXStatus] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const videoRef = useRef(null);
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
      const data = await getAnalysis(analysisId, navigate);
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(err.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, [analysisId, navigate]);

  useRequireAuth(navigate, fetchAnalysis);

  useEffect(() => {
    // Check X connection status
    const fetchXStatus = async () => {
      try {
        const data = await authenticatedFetchJson(API_ENDPOINTS.X_STATUS, {}, navigate);
        setXStatus(data);
      } catch (err) {
        // If not connected, that's okay - just means no connection
        setXStatus({ connected: false, x_username: null });
      }
    };
    
    fetchXStatus();
  }, [navigate]);

  // Fullscreen change handler
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

  const handlePostToX = async () => {
    if (!analysis) return;
    
    // Check if X is connected (OAuth 2.0)
    if (!xStatus?.connected) {
      const shouldConnect = window.confirm(
        'You need to connect your X account to post. Would you like to connect now?'
      );
      if (shouldConnect) {
        // Open X OAuth in a popup
        try {
          const response = await authenticatedFetchJson(
            `${API_ENDPOINTS.X_CONNECT}?return_url=true`,
            {},
            navigate
          );
          
          if (!response.oauth_url) {
            alert('Failed to get OAuth URL. Please try again.');
            return;
          }
          
          // Open popup window for OAuth flow
          const popupWidth = 600;
          const popupHeight = 700;
          const left = (window.screen.width - popupWidth) / 2;
          const top = (window.screen.height - popupHeight) / 2;
          
          const popup = window.open(
            response.oauth_url,
            'X OAuth',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
          );
          
          if (!popup) {
            alert('Please allow popups for this site to connect your X account.');
            return;
          }
          
          // Listen for OAuth completion message from popup
          const handleMessage = (event) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) {
              return;
            }
            
            if (event.data.type === 'X_OAUTH_SUCCESS') {
              window.removeEventListener('message', handleMessage);
              popup.close();
              // Refresh X status
              authenticatedFetchJson(API_ENDPOINTS.X_STATUS, {}, navigate)
                .then(data => {
                  setXStatus(data);
                  // Retry opening modal after connection
                  if (data.connected) {
                    setTimeout(() => handlePostToX(), 500);
                  }
                })
                .catch(() => setXStatus({ connected: false, oauth1_connected: false, x_username: null }));
            } else if (event.data.type === 'X_OAUTH_ERROR') {
              window.removeEventListener('message', handleMessage);
              popup.close();
              alert(event.data.message || 'Failed to connect X account. Please try again.');
            }
          };
          
          window.addEventListener('message', handleMessage);
          
          // Check if popup was closed manually
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', handleMessage);
            }
          }, 1000);
        } catch (err) {
          alert(err.message || 'Failed to connect X account. Please try again.');
        }
      }
      return;
    }
    
    // Check if OAuth 1.0a is connected (required for media uploads)
    if (!xStatus?.oauth1_connected) {
      const shouldConnect = window.confirm(
        'You need to connect your X account for media posting to share images. Would you like to connect now?'
      );
      if (shouldConnect) {
        try {
          // Open OAuth 1.0a login in popup
          const popupWidth = 600;
          const popupHeight = 700;
          const left = (window.screen.width - popupWidth) / 2;
          const top = (window.screen.height - popupHeight) / 2;
          
          const popup = window.open(
            API_ENDPOINTS.X_OAUTH1_LOGIN,
            'X OAuth 1.0a',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
          );
          
          if (!popup) {
            alert('Please allow popups for this site to connect your X account.');
            return;
          }
          
          const handleMessage = (event) => {
            if (event.origin !== window.location.origin) {
              return;
            }
            
            if (event.data.type === 'X_OAUTH1_SUCCESS') {
              window.removeEventListener('message', handleMessage);
              popup.close();
              authenticatedFetchJson(API_ENDPOINTS.X_STATUS, {}, navigate)
                .then(data => {
                  setXStatus(data);
                  if (data.oauth1_connected) {
                    setTimeout(() => handlePostToX(), 500);
                  }
                })
                .catch(() => setXStatus({ connected: false, oauth1_connected: false, x_username: null }));
            } else if (event.data.type === 'X_OAUTH1_ERROR') {
              window.removeEventListener('message', handleMessage);
              popup.close();
              alert(event.data.message || 'Failed to connect X account for media posting. Please try again.');
            }
          };
          
          window.addEventListener('message', handleMessage);
          
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', handleMessage);
            }
          }, 1000);
        } catch (err) {
          alert(err.message || 'Failed to connect X account for media posting. Please try again.');
        }
      }
      return;
    }
    
    // Generate share image and open modal
    setIsGeneratingImage(true);
    try {
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
      
      if (!response || !response.image_url) {
        throw new Error('Failed to generate share image');
      }
      
      // Set pre-loaded image URL and open modal
      setPreloadedImageUrl(response.image_url);
      setIsGeneratingImage(false);
      setTimeout(() => {
        setShowCreateXPost(true);
      }, 0);
    } catch (err) {
      console.error('Error generating share image:', err);
      alert('Failed to generate share image. Please try again.');
      setIsGeneratingImage(false);
    }
  };

  const handleXPostCreated = (postResponse) => {
    setShowCreateXPost(false);
    setPreloadedImageUrl(null);
    setIsGeneratingImage(false);
    if (postResponse?.url) {
      alert(`Successfully posted to X! View it here: ${postResponse.url}`);
    }
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleShareToFeed}
              disabled={isGeneratingImage || isPostingToX}
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
            <button
              onClick={handlePostToX}
              disabled={isGeneratingImage}
              className="btn"
              style={{
                padding: '10px 20px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: xStatus?.connected ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                opacity: isGeneratingImage ? 0.6 : 1
              }}
            >
              {isGeneratingImage ? (
                <>
                  <span className="btn-spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  {xStatus?.connected ? '🐦 Post to X' : '🔗 Connect X to Post'}
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

                  {/* Video Display */}
                  <div style={{
                    flex: '1',
                    minWidth: 0
                  }}>
                    {analysisResults.visualization_url && !analysisResults.visualization_url.startsWith('blob:') ? (
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
                            onError={(e) => {
                              console.error('Video load error:', e);
                              console.error('Video src:', analysisResults.visualization_url);
                            }}
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
                    ) : null}
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

      {showCreateXPost && (
        <CreateXPostModal
          isOpen={showCreateXPost}
          onClose={() => {
            setShowCreateXPost(false);
            setPreloadedImageUrl(null);
            setIsGeneratingImage(false);
          }}
          onPostCreated={handleXPostCreated}
          preloadedImageUrl={preloadedImageUrl}
          prefilledCaption={`Just completed ${analysis.exercise_name} analysis! Score: ${analysis.score}/100\n\n#ReformGym #FormAnalysis`}
          xStatus={xStatus}
        />
      )}
    </PageContainer>
  );
};

export default AnalysisDetailPage;

