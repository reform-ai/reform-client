import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProgressMetrics } from '../shared/utils/analysisApi';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { formatDateTime } from '../shared/utils/dateFormat';
import PageHeader from '../shared/components/layout/PageHeader';
import PageContainer from '../shared/components/layout/PageContainer';
import '../shared/styles/AnalysisSkeleton.css';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useRequireAuth(navigate, fetchMetrics);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProgressMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching progress metrics:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--score-excellent)';
    if (score >= 75) return 'var(--score-good)';
    if (score >= 60) return 'var(--score-warning)';
    return 'var(--score-poor)';
  };

  const mostRecentAnalysis = metrics?.recent_analyses?.[0] || null;

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">Dashboard</p>
            <h1 className="skeleton-title">Welcome back, Athlete</h1>
            <p className="skeleton-subtitle">Review your latest analysis, monitor trends, and share standout moments with your coach or community.</p>
          </div>
          <div className="hero-actions">
            <Link to="/dashboard/analyze" className="btn-primary">Run New Analysis</Link>
          </div>
        </header>

        <div className="skeleton-grid">
          {/* Most Recent Analysis */}
          <article className="skeleton-card">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0 }}>Most Recent Analysis</h3>
              {metrics && metrics.total_analyses > 0 && (
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
              )}
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            ) : error ? (
              <div>
                <p style={{ color: 'var(--accent-orange)', marginBottom: '12px' }}>
                  {error}
                </p>
                <button onClick={fetchMetrics} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                  Retry
                </button>
              </div>
            ) : !mostRecentAnalysis ? (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  No analyses yet. Run your first analysis to get started!
                </p>
                <Link to="/dashboard/analyze" className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                  Run Your First Analysis
                </Link>
              </div>
            ) : (
              <div>
                <Link
                  to={`/analyses/${mostRecentAnalysis.id}`}
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
                    cursor: 'pointer',
                    marginBottom: '16px'
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
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: getScoreColor(mostRecentAnalysis.score)
                        }}>
                          {mostRecentAnalysis.score}/100
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
                          {mostRecentAnalysis.exercise_name}
                        </div>
                      </div>
                      <p style={{
                        margin: '4px 0',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {formatDateTime(mostRecentAnalysis.created_at)}
                      </p>
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      color: 'var(--text-secondary)'
                    }}>
                      →
                    </div>
                  </div>
                </Link>

                {/* Quick Stats */}
                {metrics && metrics.total_analyses > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '12px',
                    marginTop: '16px',
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)'
                      }}>
                        {metrics.total_analyses}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)'
                      }}>
                        Total
                      </p>
                    </div>
                    {metrics.average_score !== null && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{
                          margin: '0 0 4px 0',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: getScoreColor(Math.round(metrics.average_score))
                        }}>
                          {metrics.average_score.toFixed(1)}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)'
                        }}>
                          Average
                        </p>
                      </div>
                    )}
                    {metrics.best_score !== null && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{
                          margin: '0 0 4px 0',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: getScoreColor(metrics.best_score)
                        }}>
                          {metrics.best_score}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)'
                        }}>
                          Best
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Links */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '16px',
                  flexWrap: 'wrap'
                }}>
                  <Link
                    to="/analyses"
                    className="btn"
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    View History
                  </Link>
                  <Link
                    to="/progress"
                    className="btn"
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    View Progress
                  </Link>
                </div>
              </div>
            )}
          </article>

          {/* Community Feed */}
          <article className="skeleton-card">
            <h3>Community Feed</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Connect with the community and share your progress
            </p>
            <Link 
              to="/feed" 
              className="btn btn-view-feed"
              style={{ 
                display: 'inline-block',
                background: 'transparent',
                border: '1px solid var(--accent-green)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                fontSize: '0.9rem'
              }}
            >
              View Feed
            </Link>
          </article>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
