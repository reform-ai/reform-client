import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import '../shared/utils/chartConfig'; // Ensure Chart.js is registered
import { getProgressMetrics } from '../shared/utils/analysisApi';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { formatDateTime, formatDateOnly } from '../shared/utils/dateFormat';
import { 
  getScoreTrendData, 
  getExerciseBreakdownData, 
  getChartColors, 
  getBaseChartOptions 
} from '../shared/utils/chartDataUtils';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import { SCORE_THRESHOLDS } from '../shared/constants/app';
import '../shared/styles/AnalysisSkeleton.css';
import './ProgressDashboardPage.css';

const ProgressDashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProgressMetrics(navigate);
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching progress metrics:', err);
      setError(err.message || 'Failed to load progress metrics');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useRequireAuth(navigate, fetchMetrics);

  const getScoreColor = (score) => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'var(--score-excellent)';
    if (score >= SCORE_THRESHOLDS.GOOD) return 'var(--score-good)';
    if (score >= SCORE_THRESHOLDS.WARNING) return 'var(--score-warning)';
    return 'var(--score-poor)';
  };

  const scoreTrendData = getScoreTrendData(metrics);
  const exerciseBreakdownData = getExerciseBreakdownData(metrics);
  const colors = getChartColors();
  const chartOptions = getBaseChartOptions(colors);

  const barChartOptions = exerciseBreakdownData ? {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        max: Math.max(exerciseBreakdownData.maxValue + 1, 1),
        ticks: {
          ...chartOptions.scales.y.ticks,
          stepSize: 1,
          precision: 0,
          callback: function(value) {
            return Number.isInteger(value) ? value : '';
          }
        }
      }
    }
  } : chartOptions;

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        max: 100,
        min: 0,
        ticks: {
          ...chartOptions.scales.y.ticks,
          stepSize: 20
        }
      }
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div className="skeleton-shell">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--text-primary)' }}>Loading progress dashboard...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !metrics) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div className="skeleton-shell">
          <div className="skeleton-card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-orange)', marginBottom: '16px' }}>
              {error || 'Failed to load progress metrics'}
            </p>
            <button onClick={fetchMetrics} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">Progress</p>
            <h1 className="skeleton-title">Progress Dashboard</h1>
            <p className="skeleton-subtitle">
              Track your form improvement over time
            </p>
          </div>
        </header>

        <div className="skeleton-grid" style={{ display: 'block', padding: '40px 48px 48px' }}>
          {/* Top Row: 3 equal-width cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '24px',
            width: '100%',
            alignItems: 'stretch'
          }}>
            <article className="skeleton-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  Total Analyses
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)'
                }}>
                  {metrics.total_analyses}
                </p>
              </div>
            </article>

            {(metrics.average_score !== null || metrics.best_score !== null || metrics.worst_score !== null) && (
              <article className="skeleton-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{
                    margin: '0 0 20px 0',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    Scores
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px'
                  }}>
                    {metrics.average_score !== null && (
                      <div>
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)'
                        }}>
                          Average
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '2rem',
                          fontWeight: 700,
                          color: '#2196F3'
                        }}>
                          {metrics.average_score.toFixed(1)}
                        </p>
                      </div>
                    )}
                    {metrics.best_score !== null && (
                      <div>
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)'
                        }}>
                          Best
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '2rem',
                          fontWeight: 700,
                          color: '#4CAF50'
                        }}>
                          {metrics.best_score}
                        </p>
                      </div>
                    )}
                    {metrics.worst_score !== null && (
                      <div>
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)'
                        }}>
                          Worst
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '2rem',
                          fontWeight: 700,
                          color: '#F44336'
                        }}>
                          {metrics.worst_score}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )}

            {/* Recent Analysis */}
            {metrics.recent_analyses && metrics.recent_analyses.length > 0 && (
              <article className="skeleton-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h2 style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      Recent Analysis
                    </h2>
                    <Link
                      to="/analyses"
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--accent-green)',
                        textDecoration: 'none',
                        fontWeight: 500
                      }}
                    >
                      View All →
                    </Link>
                  </div>

                  {(() => {
                    const analysis = metrics.recent_analyses[0];
                    return (
                      <Link
                        to={`/analyses/${analysis.id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        <div style={{
                          padding: '16px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '16px',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.borderColor = 'var(--accent-green)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <div style={{
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              color: getScoreColor(analysis.score)
                            }}>
                              {analysis.score}/100
                            </div>
                            <div style={{
                              padding: '4px 8px',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              textTransform: 'uppercase'
                            }}>
                              {analysis.exercise_name}
                            </div>
                          </div>
                          <div style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)'
                          }}>
                            {formatDateOnly(analysis.created_at)}
                          </div>
                        </div>
                      </Link>
                    );
                  })()}
                </div>
              </article>
            )}
          </div>

          {/* Bottom Row: 2 equal-width charts */}
          {scoreTrendData || exerciseBreakdownData ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              width: '100%'
            }}>
              {/* Score Trend Chart */}
              {scoreTrendData && (
                <article className="skeleton-card">
                  <div style={{ padding: '24px' }}>
                    <h2 style={{
                      margin: '0 0 20px 0',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      Score Trend Over Time
                    </h2>
                    <div style={{ 
                      height: '300px',
                      overflowX: scoreTrendData.labels.length > 3 ? 'auto' : 'hidden',
                      overflowY: 'hidden',
                      padding: '10px 0'
                    }}>
                      <div style={{ 
                        minWidth: scoreTrendData.labels.length > 3 ? Math.max(scoreTrendData.labels.length * 60, 600) : '100%',
                        height: '100%',
                        paddingRight: scoreTrendData.labels.length > 3 ? '20px' : '0',
                        paddingLeft: scoreTrendData.labels.length > 3 ? '10px' : '0'
                      }}>
                        <Line data={scoreTrendData} options={lineChartOptions} />
                      </div>
                    </div>
                  </div>
                </article>
              )}

              {/* Analyses by Exercise Chart */}
              {exerciseBreakdownData && (
                <article className="skeleton-card">
                  <div style={{ padding: '24px' }}>
                    <h2 style={{
                      margin: '0 0 20px 0',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      Analyses by Exercise
                    </h2>
                    <div style={{ 
                      height: '300px',
                      overflowX: exerciseBreakdownData.labels.length > 3 ? 'auto' : 'hidden',
                      overflowY: 'hidden',
                      padding: '10px 0'
                    }}>
                      <div style={{ 
                        minWidth: exerciseBreakdownData.labels.length > 3 ? Math.max(exerciseBreakdownData.labels.length * 120, 600) : '100%',
                        height: '100%',
                        paddingRight: exerciseBreakdownData.labels.length > 3 ? '20px' : '0',
                        paddingLeft: exerciseBreakdownData.labels.length > 3 ? '10px' : '0'
                      }}>
                        <Bar data={exerciseBreakdownData} options={barChartOptions} />
                      </div>
                    </div>
                  </div>
                </article>
              )}
            </div>
          ) : null}

          {/* Empty State */}
          {metrics.total_analyses === 0 && (
            <article className="skeleton-card">
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '1rem',
                  color: 'var(--text-secondary)'
                }}>
                  No analyses yet. Start tracking your progress!
                </p>
                <Link
                  to="/dashboard/analyze"
                  className="btn btn-primary"
                >
                  Run Your First Analysis
                </Link>
              </div>
            </article>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default ProgressDashboardPage;

