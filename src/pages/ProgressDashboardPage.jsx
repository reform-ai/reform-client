import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import '../shared/utils/chartConfig'; // Ensure Chart.js is registered
import { getProgressMetrics } from '../shared/utils/analysisApi';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { formatDateTime, formatDateOnly } from '../shared/utils/dateFormat';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import '../shared/styles/AnalysisSkeleton.css';
import './ProgressDashboardPage.css';

const ProgressDashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
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
  };

  useRequireAuth(navigate, fetchMetrics);

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--score-excellent)';
    if (score >= 75) return 'var(--score-good)';
    if (score >= 60) return 'var(--score-warning)';
    return 'var(--score-poor)';
  };

  const getScoreTrendData = () => {
    if (!metrics?.score_trend || metrics.score_trend.length === 0) {
      return null;
    }

    const sortedTrend = [...metrics.score_trend].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Get all unique dates for labels
    const allDates = [...new Set(sortedTrend.map(item => item.date))].sort((a, b) => 
      new Date(a) - new Date(b)
    );
    const labels = allDates.map(date => formatDateOnly(date));

    // Group by exercise and create datasets
    const exerciseGroups = {};
    sortedTrend.forEach(item => {
      const exercise = item.exercise || 'Overall';
      if (!exerciseGroups[exercise]) {
        exerciseGroups[exercise] = {};
      }
      exerciseGroups[exercise][item.date] = item.score;
    });

    // Exercise colors
    const exerciseColors = {
      'Squat': { border: '#4CAF50', bg: 'rgba(76, 175, 80, 0.15)', point: '#4CAF50', hover: '#66BB6A' },
      'Bench': { border: '#2196F3', bg: 'rgba(33, 150, 243, 0.15)', point: '#2196F3', hover: '#42A5F5' },
      'Deadlift': { border: '#FF9800', bg: 'rgba(255, 152, 0, 0.15)', point: '#FF9800', hover: '#FFB74D' },
      'Overall': { border: '#4CAF50', bg: 'rgba(76, 175, 80, 0.15)', point: '#4CAF50', hover: '#66BB6A' }
    };

    // Create dataset for each exercise
    const datasets = Object.keys(exerciseGroups).map(exercise => {
      const color = exerciseColors[exercise] || exerciseColors['Overall'];
      // Map each date to its score (or null if no data for that date)
      const data = allDates.map(date => exerciseGroups[exercise][date] || null);
      
      return {
        label: exercise,
        data: data,
        borderColor: color.border,
        backgroundColor: color.bg,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: color.point,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: color.hover,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        spanGaps: false  // Don't connect points across gaps
      };
    });

    return {
      labels,
      datasets
    };
  };

  const getExerciseBreakdownData = () => {
    if (!metrics?.analyses_by_exercise) {
      return null;
    }

    const exerciseNames = {
      'Squat': 'Squat',
      'Bench': 'Bench',
      'Deadlift': 'Deadlift'
    };

    const labels = Object.keys(metrics.analyses_by_exercise).map(
      key => exerciseNames[key] || key
    );
    const data = Object.values(metrics.analyses_by_exercise);
    const maxValue = Math.max(...data, 0);

    const chartColors = [
      { bg: 'rgba(76, 175, 80, 0.8)', border: '#4CAF50' },
      { bg: 'rgba(33, 150, 243, 0.8)', border: '#2196F3' },
      { bg: 'rgba(255, 152, 0, 0.8)', border: '#FF9800' },
      { bg: 'rgba(156, 39, 176, 0.8)', border: '#9C27B0' },
      { bg: 'rgba(244, 67, 54, 0.8)', border: '#F44336' }
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Number of Analyses',
          data,
          backgroundColor: labels.map((_, i) => chartColors[i % chartColors.length].bg),
          borderColor: labels.map((_, i) => chartColors[i % chartColors.length].border),
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        }
      ],
      maxValue
    };
  };

  const scoreTrendData = getScoreTrendData();
  const exerciseBreakdownData = getExerciseBreakdownData();

  const getComputedColor = (cssVar, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(cssVar).trim();
    return value || fallback;
  };

  const colors = {
    text: getComputedColor('--text-primary', '#333333'),
    textSecondary: getComputedColor('--text-secondary', '#666666'),
    grid: getComputedColor('--border-color', 'rgba(0, 0, 0, 0.1)')
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: colors.text,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: 500
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        cornerRadius: 6
      }
    },
    scales: {
      x: {
        ticks: {
          color: colors.textSecondary,
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        },
        grid: {
          color: colors.grid,
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: colors.textSecondary,
          font: {
            family: 'Inter, sans-serif',
            size: 11
          },
          stepSize: 1,
          precision: 0
        },
        grid: {
          color: colors.grid,
          drawBorder: false
        },
        beginAtZero: true
      }
    }
  };

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

