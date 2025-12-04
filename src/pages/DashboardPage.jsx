import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProgressMetrics } from '../shared/utils/analysisApi';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { formatDateTime } from '../shared/utils/dateFormat';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import PageHeader from '../shared/components/layout/PageHeader';
import PageContainer from '../shared/components/layout/PageContainer';
import AnalysisModal from '../shared/components/modals/AnalysisModal';
import { SCORE_THRESHOLDS } from '../shared/constants/app';
import '../shared/styles/AnalysisSkeleton.css';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [workoutPlanLoading, setWorkoutPlanLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProgressMetrics(navigate);
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching progress metrics:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useRequireAuth(navigate, fetchMetrics);

  // Fetch active workout plan
  const fetchWorkoutPlan = useCallback(async () => {
    setWorkoutPlanLoading(true);
    try {
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.WORKOUT_PLANS_ACTIVE,
        { method: 'GET' },
        null // Don't navigate on error, just silently fail
      );
      if (data && data.id) {
        setWorkoutPlan(data);
        // Find today's workout
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = dayNames[dayOfWeek];
        
        // Find current week (assuming plan started or we're in week 1)
        const planData = data.plan_data;
        const weeks = planData?.weeks || [];
        
        if (weeks.length > 0) {
          // For now, show week 1's workout for today
          // In a full implementation, you'd calculate which week based on plan start date
          const currentWeek = weeks[0];
          const workouts = currentWeek?.workouts || [];
          
          // Find workout for today
          const workout = workouts.find(w => w.day_name === todayName);
          if (workout) {
            setTodayWorkout(workout);
          } else {
            setTodayWorkout(null);
          }
        } else {
          setTodayWorkout(null);
        }
      } else {
        setWorkoutPlan(null);
        setTodayWorkout(null);
      }
    } catch (error) {
      // Silently fail - user might not have a plan yet
      setWorkoutPlan(null);
      setTodayWorkout(null);
    } finally {
      setWorkoutPlanLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkoutPlan();
  }, [fetchWorkoutPlan]);

  const getScoreColor = (score) => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'var(--score-excellent)';
    if (score >= SCORE_THRESHOLDS.GOOD) return 'var(--score-good)';
    if (score >= SCORE_THRESHOLDS.WARNING) return 'var(--score-warning)';
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
            <div className="dashboard-recent-header">
              <h3 style={{ margin: 0 }}>Most Recent Analysis</h3>
              {metrics && metrics.total_analyses > 0 && (
                <Link
                  to="/analyses"
                  className="dashboard-view-all-link"
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
              <>
                <div
                  onClick={() => {
                    setSelectedAnalysisId(mostRecentAnalysis.id);
                    setShowAnalysisModal(true);
                  }}
                  style={{
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

                {/* Quick Stats */}
                {metrics && metrics.total_analyses > 0 && (
                  <div className="dashboard-quick-stats">
                    <div className="dashboard-stat-item">
                      <p className="dashboard-stat-value" style={{ color: 'var(--text-primary)' }}>
                        {metrics.total_analyses}
                      </p>
                      <p className="dashboard-stat-label">Total</p>
                    </div>
                    {metrics.average_score !== null && (
                      <div className="dashboard-stat-item">
                        <p className="dashboard-stat-value" style={{ color: getScoreColor(Math.round(metrics.average_score)) }}>
                          {metrics.average_score.toFixed(1)}
                        </p>
                        <p className="dashboard-stat-label">Average</p>
                      </div>
                    )}
                    {metrics.best_score !== null && (
                      <div className="dashboard-stat-item">
                        <p className="dashboard-stat-value" style={{ color: getScoreColor(metrics.best_score) }}>
                          {metrics.best_score}
                        </p>
                        <p className="dashboard-stat-label">Best</p>
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
              </>
            )}
          </article>

          {/* Right Column - Workout Plan and Community Feed */}
          <div className="dashboard-right-column">
            {/* My Workout Plan */}
            <article className="skeleton-card dashboard-workout-card">
              <div className="dashboard-workout-header">
                <h3>My Workout Plan</h3>
                {workoutPlan && (
                  <Link
                    to={workoutPlan.id ? `/workout-plans/${workoutPlan.id}` : '/workout-plans'}
                    className="dashboard-view-all-link"
                  >
                    My Plans →
                  </Link>
                )}
              </div>

              {workoutPlanLoading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
              ) : !workoutPlan ? (
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    No workout plan created yet.
                  </p>
                  <Link
                    to="/workout-plans/questionnaire"
                    className="btn btn-primary"
                    style={{ fontSize: '0.9rem', width: '100%', textAlign: 'center', display: 'block' }}
                  >
                    Create Plan
                  </Link>
                </div>
              ) : !todayWorkout ? (
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    No workout scheduled for today.
                  </p>
                  <Link
                    to={workoutPlan.id ? `/workout-plans/${workoutPlan.id}` : '/workout-plans'}
                    className="btn"
                    style={{
                      fontSize: '0.9rem',
                      width: '100%',
                      textAlign: 'center',
                      display: 'block',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      textDecoration: 'none'
                    }}
                  >
                    View Plan
                  </Link>
                </div>
              ) : (
                <div>
                  <div style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {todayWorkout.day_name}
                      </h4>
                      <span style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)'
                      }}>
                        ~{todayWorkout.estimated_duration_minutes} min
                      </span>
                    </div>
                    <p style={{
                      margin: '4px 0 8px 0',
                      fontSize: '0.9rem',
                      color: 'var(--accent-green)',
                      fontWeight: 500
                    }}>
                      {todayWorkout.focus}
                    </p>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <strong>{todayWorkout.exercises?.length || 0}</strong> exercises
                    </div>
                  </div>
                  <Link
                    to={workoutPlan.id ? `/workout-plans/${workoutPlan.id}` : '/workout-plans'}
                    className="btn"
                    style={{
                      fontSize: '0.9rem',
                      width: '100%',
                      textAlign: 'center',
                      display: 'block',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      textDecoration: 'none'
                    }}
                  >
                    My Plans →
                  </Link>
                </div>
              )}
            </article>

            {/* Community Feed - Half Height */}
            <article className="skeleton-card dashboard-feed-card">
              <h3>Community Feed</h3>
              <p className="dashboard-feed-description">
                Connect with the community and share your progress
              </p>
              <Link 
                to="/feed" 
                className="btn btn-view-feed"
              >
                View Feed →
              </Link>
            </article>
          </div>
        </div>
      </div>

      {showAnalysisModal && (
        <AnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => {
            setShowAnalysisModal(false);
            setSelectedAnalysisId(null);
          }}
          analysisId={selectedAnalysisId}
        />
      )}
    </PageContainer>
  );
};

export default DashboardPage;
