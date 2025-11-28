import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import { isUserLoggedIn } from '../shared/utils/authStorage';
import { parseUTCDate } from '../shared/utils/dateFormat';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import ViewModeSelector from '../shared/components/workout/ViewModeSelector';
import WorkoutCalendar from '../shared/components/workout/WorkoutCalendar';
import DailyView from '../shared/components/workout/DailyView';
import WeeklyView from '../shared/components/workout/WeeklyView';
import './WorkoutPlanViewerPage.css';

const WorkoutPlanViewerPage = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  
  // New state for view management
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentDay, setCurrentDay] = useState(null);

  // Compute planData and weeks BEFORE early returns (using optional chaining)
  // This allows useEffect to always be called in same order
  const planData = plan?.plan_data;
  const weeks = planData?.weeks || [];
  const metadata = planData?.metadata || {};

  // Calculate workout date from week start_date and workout day (1-7, where 1=Monday)
  // Must be defined before useEffect that uses it
  const calculateWorkoutDate = (weekStartDate, day) => {
    if (!weekStartDate || !day) return null;
    const start = parseUTCDate(weekStartDate);
    if (!start) return null;
    
    // day is 1-7 where 1=Monday, 2=Tuesday, etc.
    // JavaScript Date.getDay() returns 0=Sunday, 1=Monday, etc.
    const targetWeekday = day === 7 ? 0 : day; // Sunday is 0 in JS, 7 in our system
    
    const startWeekday = start.getDay();
    const daysDiff = (targetWeekday - startWeekday + 7) % 7;
    const workoutDate = new Date(start);
    workoutDate.setDate(start.getDate() + daysDiff);
    
    return workoutDate;
  };

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

  // Initialize selected days with all workout days when plan loads
  // MUST be before early returns to follow Rules of Hooks
  useEffect(() => {
    if (planData && weeks.length > 0) {
      const workoutDays = new Set();
      weeks.forEach(week => {
        if (week.start_date) {
          week.workouts.forEach(workout => {
            if (workout.day) {
              const workoutDate = calculateWorkoutDate(week.start_date, workout.day);
              if (workoutDate) {
                const dateString = workoutDate.toISOString().split('T')[0];
                workoutDays.add(dateString);
              }
            }
          });
        }
      });
      setSelectedDays(workoutDays);
      
      // Set initial week to first week
      setCurrentWeekIndex(0);
    }
  }, [planData, weeks]);

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

  // Handle day selection toggle
  const handleDayToggle = (dateString) => {
    setSelectedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateString)) {
        newSet.delete(dateString);
      } else {
        newSet.add(dateString);
      }
      return newSet;
    });
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Handle week change
  const handleWeekChange = (weekIndex) => {
    setCurrentWeekIndex(weekIndex);
  };

  // Handle day change (for Daily view)
  const handleDayChange = (dateString) => {
    setCurrentDay(dateString);
  };

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

        {/* New 3-Card Layout */}
        {weeks && weeks.length > 0 ? (
          <div className="plan-view-controls">
            {/* Top Row: View Mode Selector and Calendar */}
            <div className="controls-top-row">
              <ViewModeSelector
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
              />
              <WorkoutCalendar
                weeks={weeks}
                selectedDays={selectedDays}
                onDayToggle={handleDayToggle}
              />
            </div>

            {/* Bottom Card: Plan Display */}
            <div className="plan-display-card">
              {viewMode === 'daily' ? (
                <DailyView
                  selectedDays={Array.from(selectedDays)}
                  planData={planData}
                  onDayChange={handleDayChange}
                />
              ) : (
                <WeeklyView
                  selectedDays={selectedDays}
                  planData={planData}
                  currentWeekIndex={currentWeekIndex}
                  onWeekChange={handleWeekChange}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="plan-view-controls">
            <div className="error-container">
              <p>No workout plan data available. Please regenerate your plan.</p>
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

