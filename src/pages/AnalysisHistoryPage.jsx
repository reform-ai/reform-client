import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalyses, getAnalysis } from '../shared/utils/analysisApi';
import { isUserLoggedIn } from '../shared/utils/authStorage';
import { formatDateTime, formatDateOnly, formatTimeOnly, parseUTCDate } from '../shared/utils/dateFormat';
import { normalizeAnalysisResults, getFpsFromAnalysis, getComponentScores as getComponentScoresFromNormalizer } from '../shared/utils/analysisDataNormalizer';
import { getScoreColor } from '../shared/utils/scoreUtils';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import ScoreBreakdown from '../shared/components/ScoreBreakdown';
import AnglePlot from '../shared/components/charts/AnglePlot';
import AnalysisFilterBar from '../shared/components/analysis/AnalysisFilterBar';
import CreatePostModal from '../shared/components/modals/CreatePostModal';
import '../shared/styles/AnalysisSkeleton.css';
import './AnalysisHistoryPage.css';

const AnalysisHistoryPage = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedAnalysisDetails, setSelectedAnalysisDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
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
  
  // Pagination
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  
  // Filters
  const [exerciseFilter, setExerciseFilter] = useState(null);
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isUserLoggedIn()) {
      navigate('/?login=1');
      return;
    }

    fetchAnalyses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, exerciseFilter, minScore, maxScore, startDate, endDate]);

  useEffect(() => {
    if (selectedAnalysis) {
      fetchAnalysisDetails(selectedAnalysis.id);
    }
  }, [selectedAnalysis]);

  const fetchAnalyses = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        limit,
        offset,
        exercise: exerciseFilter !== null ? exerciseFilter : null,
        minScore: minScore ? parseInt(minScore) : null,
        maxScore: maxScore ? parseInt(maxScore) : null,
        startDate: startDate || null,
        endDate: endDate || null
      };

      const data = await getAnalyses(params);
      // Sort by created_at descending (newest first) as a safety measure
      const sortedAnalyses = (data.analyses || []).sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA; // Descending order (newest first)
      });
      setAnalyses(sortedAnalyses);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching analyses:', err);
      setError(err.message || 'Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisDetails = async (analysisId) => {
    setLoadingDetails(true);
    try {
      const data = await getAnalysis(analysisId);
      setSelectedAnalysisDetails(data);
    } catch (err) {
      console.error('Error fetching analysis details:', err);
      setSelectedAnalysisDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExerciseChange = (e) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value);
    setExerciseFilter(value);
    setOffset(0);
  };

  const handleMinScoreChange = (e) => {
    setMinScore(e.target.value);
    setOffset(0);
  };

  const handleMaxScoreChange = (e) => {
    setMaxScore(e.target.value);
    setOffset(0);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setOffset(0);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setOffset(0);
  };

  const handleClearFilters = () => {
    setExerciseFilter(null);
    setMinScore('');
    setMaxScore('');
    setStartDate('');
    setEndDate('');
    setOffset(0);
  };

  const handleAnalysisClick = (analysis) => {
    setSelectedAnalysis(analysis);
  };


  const handleToggleExpanded = (key) => {
    setExpandedStates(prev => {
      const newState = {
        ...prev,
        [key]: !prev[key]
      };
      
      // Scroll to expanded content after state update
      if (newState[key]) {
        setTimeout(() => {
          const detailPanel = document.querySelector('.analysis-history-detail-panel > div');
          if (detailPanel) {
            // Find all expanded sections (they have marginLeft: '20px' style)
            const expandedSections = detailPanel.querySelectorAll('div[style*="marginLeft"]');
            expandedSections.forEach(section => {
              const rect = section.getBoundingClientRect();
              const panelRect = detailPanel.getBoundingClientRect();
              
              // If section is below the visible area or partially visible, scroll to it
              if (rect.top > panelRect.bottom - 50 || rect.bottom > panelRect.bottom) {
                section.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              }
            });
          }
        }, 200);
      }
      
      return newState;
    });
  };

  const getAnalysisResults = () => {
    if (!selectedAnalysisDetails) return null;
    // Normalize the analysis data to ensure consistent format
    return normalizeAnalysisResults(selectedAnalysisDetails);
  };

  const getComponentScores = () => {
    if (!selectedAnalysisDetails) return {};
    // Use the normalizer's getComponentScores function for consistency
    return getComponentScoresFromNormalizer(selectedAnalysisDetails.form_analysis);
  };

  const hasActiveFilters = exerciseFilter !== null || minScore || maxScore || startDate || endDate;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  const hasNextPage = offset + limit < total;
  const hasPrevPage = offset > 0;
  const analysisResults = getAnalysisResults();
  const componentScores = getComponentScores();

  // Check if there are multiple analyses on the same date
  const getDateCounts = () => {
    const dateCounts = {};
    analyses.forEach(analysis => {
      const dateKey = formatDateOnly(analysis.created_at);
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    });
    return dateCounts;
  };

  const dateCounts = getDateCounts();

  const handleShareToFeed = async () => {
    if (!selectedAnalysisDetails) return;
    
    setIsGeneratingImage(true);
    try {
      // Generate share image
      const response = await authenticatedFetchJson(
        API_ENDPOINTS.ANALYSIS_GENERATE_SHARE_IMAGE(selectedAnalysisDetails.id),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        navigate
      );
      
      // Set pre-loaded image URLs
      setPreloadedImageUrl(response.image_url);
      setPreloadedThumbnailUrl(response.thumbnail_url || response.image_url);
      
      // Open modal
      setShowCreatePost(true);
    } catch (err) {
      console.error('Error generating share image:', err);
      alert('Failed to generate share image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    setPreloadedImageUrl(null);
    setPreloadedThumbnailUrl(null);
    navigate('/feed');
  };

  // Format date display: show time on second line if multiple analyses on same date
  // All dates from API are in UTC - uses dateFormat utilities to convert to user's local timezone
  const formatAnalysisDate = (analysis) => {
    const dateKey = formatDateOnly(analysis.created_at);
    const hasMultipleOnDate = dateCounts[dateKey] > 1;
    
    if (hasMultipleOnDate) {
      // Use formatTimeOnly from dateFormat.js - ensures consistent UTC->local conversion
      return {
        date: formatDateOnly(analysis.created_at), // formatDateOnly handles UTC->local conversion
        time: formatTimeOnly(analysis.created_at), // formatTimeOnly handles UTC->local conversion
        showTime: true
      };
    } else {
      // Just show date (formatDateOnly already handles UTC->local conversion)
      return {
        date: formatDateOnly(analysis.created_at),
        time: '',
        showTime: false
      };
    }
  };

  if (loading && analyses.length === 0) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div className="skeleton-shell">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--text-primary)' }}>Loading analysis history...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell analysis-history-page">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">History</p>
            <h1 className="skeleton-title">My Analyses</h1>
            <p className="skeleton-subtitle">
              View and track your exercise form analysis history
            </p>
          </div>
        </header>

        <AnalysisFilterBar
          exerciseFilter={exerciseFilter}
          minScore={minScore}
          maxScore={maxScore}
          startDate={startDate}
          endDate={endDate}
          onExerciseChange={handleExerciseChange}
          onMinScoreChange={handleMinScoreChange}
          onMaxScoreChange={handleMaxScoreChange}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

              {/* Error Message */}
              {error && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: 'var(--accent-orange)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  {error}
                  <button
                    onClick={fetchAnalyses}
                    className="btn"
                    style={{
                      marginLeft: '12px',
                      padding: '4px 12px',
                      fontSize: '0.85rem',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white'
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

        {/* Main Content: List and Details */}
        <div className="skeleton-grid">
          {/* Left Side: Analyses List */}
          <article className="skeleton-card" style={{ flex: '0 0 400px', maxWidth: '400px' }}>
            <div style={{ padding: '24px' }}>
              {/* Results Summary */}
              {!loading && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}>
                  <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    {total} {total === 1 ? 'analysis' : 'analyses'} found
                    {hasActiveFilters && ' (filtered)'}
                  </p>
                </div>
              )}

              {/* Analyses List */}
              {analyses.length === 0 && !loading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-secondary)'
                }}>
                  <p style={{ marginBottom: '16px', fontSize: '1rem' }}>
                    No analyses found.
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={handleClearFilters}
                      className="btn btn-primary"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/dashboard/analyze')}
                      className="btn btn-primary"
                    >
                      Run Your First Analysis
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '20px',
                    maxHeight: '60vh',
                    overflowY: 'auto'
                  }}>
                    {analyses.map((analysis) => (
                      <div
                        key={analysis.id}
                        onClick={() => handleAnalysisClick(analysis)}
                        style={{
                          padding: '12px 16px',
                          background: selectedAnalysis?.id === analysis.id 
                            ? 'var(--bg-secondary)' 
                            : 'var(--bg-tertiary)',
                          border: selectedAnalysis?.id === analysis.id
                            ? '2px solid var(--accent-green)'
                            : '1px solid var(--border-color)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedAnalysis?.id !== analysis.id) {
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                            e.currentTarget.style.borderColor = 'var(--accent-green)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedAnalysis?.id !== analysis.id) {
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                          }
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            flex: 1,
                            lineHeight: '1.2',
                            textAlign: 'center'
                          }}>
                            {(() => {
                              const dateInfo = formatAnalysisDate(analysis);
                              return (
                                <>
                                  <div>{dateInfo.date}</div>
                                  {dateInfo.showTime && (
                                    <div style={{
                                      fontSize: '0.9rem',
                                      fontWeight: 400,
                                      color: 'var(--text-secondary)',
                                      marginTop: '2px'
                                    }}>
                                      {dateInfo.time}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          <div style={{
                            padding: '4px 8px',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            textTransform: 'uppercase'
                          }}>
                            {analysis.exercise_name}
                          </div>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: getScoreColor(analysis.score)
                          }}>
                            {analysis.score}/100
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 0',
                      borderTop: '1px solid var(--border-color)'
                    }}>
                      <button
                        onClick={() => setOffset(Math.max(0, offset - limit))}
                        disabled={!hasPrevPage || loading}
                        className="btn"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.9rem',
                          background: hasPrevPage ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          color: hasPrevPage ? 'var(--text-primary)' : 'var(--text-tertiary)',
                          cursor: hasPrevPage ? 'pointer' : 'not-allowed',
                          opacity: hasPrevPage ? 1 : 0.5
                        }}
                      >
                        Previous
                      </button>
                      
                      <span style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)'
                      }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setOffset(offset + limit)}
                        disabled={!hasNextPage || loading}
                        className="btn"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.9rem',
                          background: hasNextPage ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          color: hasNextPage ? 'var(--text-primary)' : 'var(--text-tertiary)',
                          cursor: hasNextPage ? 'pointer' : 'not-allowed',
                          opacity: hasNextPage ? 1 : 0.5
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </article>

          {/* Right Side: Detail Panel */}
          <article className="skeleton-card analysis-history-detail-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 200px)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
              {!selectedAnalysis ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'var(--text-secondary)'
                }}>
                  <p style={{ fontSize: '1rem', marginBottom: '8px' }}>
                    Select an analysis to view details
                  </p>
                  <p style={{ fontSize: '0.9rem' }}>
                    Click on any analysis from the list to see its full breakdown
                  </p>
                </div>
              ) : loadingDetails ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-secondary)'
                }}>
                  <p>Loading analysis details...</p>
                </div>
              ) : !selectedAnalysisDetails ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--accent-orange)'
                }}>
                  <p>Failed to load analysis details</p>
                  <button
                    onClick={() => fetchAnalysisDetails(selectedAnalysis.id)}
                    className="btn btn-primary"
                    style={{ marginTop: '12px' }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {/* Analysis Info */}
                  <div style={{ marginBottom: '24px' }}>
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
                      gridTemplateColumns: 'repeat(3, 1fr)',
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
                          {selectedAnalysisDetails.exercise_name}
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
                          color: getScoreColor(selectedAnalysisDetails.score)
                        }}>
                          {selectedAnalysisDetails.score}/100
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
                          {formatDateTime(selectedAnalysisDetails.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Share to Feed Button */}
                    <div style={{ marginTop: '16px' }}>
                      <button
                        onClick={handleShareToFeed}
                        disabled={isGeneratingImage}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '10px 20px',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
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
                  </div>

                  {/* Score Breakdown and Charts */}
                  {analysisResults && (
                    <>
                      {selectedAnalysisDetails.camera_angle_info?.should_warn && (
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
                              {selectedAnalysisDetails.camera_angle_info.message}
                            </p>
                            {selectedAnalysisDetails.camera_angle_info.angle_estimate && (
                              <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                Estimated angle: {selectedAnalysisDetails.camera_angle_info.angle_estimate}°
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
                              fontStyle: selectedAnalysisDetails?.notes ? 'normal' : 'italic'
                            }}>
                              {selectedAnalysisDetails?.notes || 'no notes'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </article>
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
          prefilledCaption={selectedAnalysisDetails ? `Just completed ${selectedAnalysisDetails.exercise_name} analysis! Score: ${selectedAnalysisDetails.score}/100` : ''}
        />
      )}
    </PageContainer>
  );
};

export default AnalysisHistoryPage;
