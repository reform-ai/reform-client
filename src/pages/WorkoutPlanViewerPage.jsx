import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import { isUserLoggedIn } from '../shared/utils/authStorage';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import './WorkoutPlanViewerPage.css';

const WorkoutPlanViewerPage = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    if (!isUserLoggedIn()) {
      navigate('/?login=1');
      return;
    }

    if (planId) {
      fetchPlan(planId);
    } else {
      fetchActivePlan();
    }
  }, [navigate, planId]);

  const fetchPlan = async (id) => {
    try {
      setLoading(true);
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.WORKOUT_PLAN(id),
        { method: 'GET' },
        navigate
      );
      setPlan(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch plan:', err);
      setError(err.message || 'Failed to load workout plan');
      setLoading(false);
    }
  };

  const fetchActivePlan = async () => {
    try {
      setLoading(true);
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.WORKOUT_PLANS_ACTIVE,
        { method: 'GET' },
        navigate
      );
      setPlan(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch active plan:', err);
      setError(err.message || 'No active workout plan found');
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!plan || !plan.id) return;

    if (!window.confirm('Are you sure you want to regenerate this plan? The current plan will be deactivated.')) {
      return;
    }

    try {
      setRegenerating(true);
      const result = await authenticatedFetchJson(
        API_ENDPOINTS.WORKOUT_PLAN_REGENERATE(plan.id),
        {
          method: 'POST',
          body: JSON.stringify({})
        },
        navigate
      );

      // Navigate to new plan
      navigate(`/workout-plans/${result.new_plan_id}`);
    } catch (err) {
      console.error('Failed to regenerate plan:', err);
      alert(err.message || 'Failed to regenerate plan');
      setRegenerating(false);
    }
  };

  const handleStartOver = async () => {
    if (!plan || !plan.id) return;

    if (!window.confirm('Are you sure you want to start over? This will delete your current plan and you\'ll need to fill out the questionnaire again.')) {
      return;
    }

    try {
      await authenticatedFetchJson(
        API_ENDPOINTS.WORKOUT_PLAN_DELETE(plan.id),
        {
          method: 'DELETE'
        },
        navigate
      );

      // Navigate to questionnaire to start over
      navigate('/workout-plans/questionnaire');
    } catch (err) {
      console.error('Failed to delete plan:', err);
      alert(err.message || 'Failed to delete plan');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Workout Plan" />
        <div className="loading-container">
          <p>Loading workout plan...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !plan) {
    return (
      <PageContainer>
        <PageHeader title="Workout Plan" />
        <div className="error-container">
          <p>{error || 'Plan not found'}</p>
          <button onClick={() => navigate('/workout-plans/questionnaire')} className="create-button">
            Create New Plan
          </button>
        </div>
      </PageContainer>
    );
  }

  const planData = plan.plan_data;
  const weeks = planData?.weeks || [];
  const metadata = planData?.metadata || {};

  return (
    <PageContainer>
      <PageHeader title="Your Workout Plan" />
      <div className="plan-viewer-container">
        {/* Plan Header */}
        <div className="plan-header">
          <div className="plan-info">
            <h2 className="plan-title">
              {metadata.training_split?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Plan
            </h2>
            <div className="plan-meta">
              <span className="meta-item">
                <strong>Duration:</strong> {metadata.duration_weeks} weeks
              </span>
              <span className="meta-item">
                <strong>Frequency:</strong> {metadata.weekly_frequency} days/week
              </span>
              <span className="meta-item">
                <strong>Level:</strong> {metadata.experience_level?.charAt(0).toUpperCase() + metadata.experience_level?.slice(1)}
              </span>
              <span className="meta-item">
                <strong>Version:</strong> {plan.version}
              </span>
            </div>
          </div>
          <div className="plan-actions">
            <button
              onClick={handleRegenerate}
              className="regenerate-button"
              disabled={regenerating}
            >
              {regenerating ? 'Regenerating...' : 'Regenerate Plan'}
            </button>
            <button
              onClick={handleStartOver}
              className="start-over-button"
            >
              Start Over
            </button>
          </div>
        </div>

        {/* Week Selector */}
        {weeks.length > 1 && (
          <div className="week-selector">
            {weeks.map((week, index) => (
              <button
                key={week.week_number}
                onClick={() => setSelectedWeek(index)}
                className={`week-button ${selectedWeek === index ? 'active' : ''}`}
              >
                Week {week.week_number}
              </button>
            ))}
          </div>
        )}

        {/* Week Content */}
        {weeks[selectedWeek] && (
          <div className="week-content">
            <h3 className="week-title">Week {weeks[selectedWeek].week_number}</h3>
            <div className="workouts-grid">
              {weeks[selectedWeek].workouts.map((workout, workoutIndex) => (
                <div key={workoutIndex} className="workout-card">
                  <div className="workout-header">
                    <h4 className="workout-day">{workout.day_name}</h4>
                    <p className="workout-focus">{workout.focus}</p>
                    <p className="workout-duration">~{workout.estimated_duration_minutes} min</p>
                  </div>
                  <div className="exercises-list">
                    {workout.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="exercise-item">
                        <div className="exercise-header">
                          <h5 className="exercise-name">{exercise.name}</h5>
                          <span className="exercise-sets-reps">
                            {exercise.sets} sets × {exercise.reps}
                            {exercise.rpe && ` @ RPE ${exercise.rpe}`}
                          </span>
                        </div>
                        {exercise.rest_seconds && (
                          <p className="exercise-rest">Rest: {exercise.rest_seconds}s</p>
                        )}
                        {exercise.ai_notes && (
                          <p className="exercise-notes">{exercise.ai_notes}</p>
                        )}
                        {exercise.notes && (
                          <p className="exercise-notes">{exercise.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progression Rules */}
        {planData.progression_rules && (
          <div className="progression-section">
            <h3 className="section-title">Progression</h3>
            <p className="progression-info">
              <strong>Type:</strong> {planData.progression_rules.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
            {planData.progression_rules.increment_per_week && (
              <p className="progression-info">
                <strong>Increment:</strong> {planData.progression_rules.increment_per_week} per week
              </p>
            )}
            {planData.progression_rules.deload_week && (
              <p className="progression-info">
                <strong>Deload:</strong> Every {planData.progression_rules.deload_week} weeks
              </p>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default WorkoutPlanViewerPage;

