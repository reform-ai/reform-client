import React, { useEffect, useRef } from 'react';
import { parseUTCDate } from '../../utils/dateFormat';
import './DailyView.css';

/**
 * Daily view component - shows one day at a time with Previous/Next Day navigation
 * @param {Object} props
 * @param {Array} props.selectedDays - Array of date strings (YYYY-MM-DD) that are selected
 * @param {Object} props.planData - Plan data object
 * @param {Function} props.onDayChange - Callback when day changes (dateString) => void
 */
const DailyView = ({ selectedDays, planData, onDayChange }) => {
  const [currentDayIndex, setCurrentDayIndex] = React.useState(0);
  const dayRef = useRef(null);

  // Sort selected days chronologically
  const sortedDays = React.useMemo(() => {
    return [...selectedDays].sort((a, b) => {
      return new Date(a) - new Date(b);
    });
  }, [selectedDays]);

  // Initialize to first selected day
  useEffect(() => {
    if (sortedDays.length > 0 && currentDayIndex >= sortedDays.length) {
      setCurrentDayIndex(0);
    }
  }, [sortedDays, currentDayIndex]);

  // Scroll to top when day changes
  useEffect(() => {
    if (dayRef.current) {
      dayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentDayIndex]);

  // Notify parent of day change
  useEffect(() => {
    if (sortedDays.length > 0 && sortedDays[currentDayIndex]) {
      onDayChange(sortedDays[currentDayIndex]);
    }
  }, [currentDayIndex, sortedDays, onDayChange]);

  const handlePreviousDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    } else {
      // Loop to last day
      setCurrentDayIndex(sortedDays.length - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < sortedDays.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    } else {
      // Loop to first day
      setCurrentDayIndex(0);
    }
  };

  // Calculate workout date from week start_date and workout day (1-7, where 1=Monday)
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

  const getWorkoutForDate = (dateString) => {
    if (!planData || !planData.weeks) return null;

    for (const week of planData.weeks) {
      if (!week.start_date) continue;
      
      for (const workout of week.workouts) {
        if (workout.day) {
          const workoutDate = calculateWorkoutDate(week.start_date, workout.day);
          if (workoutDate) {
            const workoutDateString = workoutDate.toISOString().split('T')[0];
            if (workoutDateString === dateString) {
              return { workout, week };
            }
          }
        }
      }
    }
    return null;
  };

  if (sortedDays.length === 0) {
    return (
      <div className="daily-view-empty">
        <p>No days selected. Please select days from the calendar.</p>
      </div>
    );
  }

  const currentDateString = sortedDays[currentDayIndex];
  const workoutData = getWorkoutForDate(currentDateString);
  const currentDate = parseUTCDate(currentDateString);

  const formatDayDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isRestDay = !workoutData || workoutData.workout.focus === 'Rest Day' || workoutData.workout.exercises.length === 0;

  return (
    <div className="daily-view" ref={dayRef}>
      <div className="daily-navigation">
        <button
          onClick={handlePreviousDay}
          className="nav-button prev"
          disabled={sortedDays.length === 0}
        >
          ◀ Previous Day
        </button>
        <div className="current-day-info">
          <h3 className="current-day-title">{formatDayDisplay(currentDate)}</h3>
          <div className="day-counter">
            {currentDayIndex + 1} of {sortedDays.length}
          </div>
        </div>
        <button
          onClick={handleNextDay}
          className="nav-button next"
          disabled={sortedDays.length === 0}
        >
          Next Day ▶
        </button>
      </div>

      <div className="daily-content">
        {isRestDay ? (
          <div className="rest-day-card">
            <div className="rest-day-header">
              <h4 className="rest-day-title">Rest Day</h4>
            </div>
            <div className="rest-day-message">
              <p>Rest and recovery day</p>
            </div>
          </div>
        ) : (
          <div className="workout-card">
            <div className="workout-header">
              <h4 className="workout-focus">{workoutData.workout.focus}</h4>
              {workoutData.workout.estimated_duration_minutes && (
                <p className="workout-duration">
                  ~{workoutData.workout.estimated_duration_minutes} min
                </p>
              )}
            </div>
            <div className="exercises-list">
              {workoutData.workout.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="exercise-item">
                  <div className="exercise-header">
                    <h5 className="exercise-name">{exercise.name}</h5>
                    <span className="exercise-sets-reps">
                      {exercise.sets} sets × {exercise.reps}
                      {exercise.rpe && ` @ RPE ${exercise.rpe}`}
                      {exercise.weight && ` @ ${exercise.weight}`}
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
        )}
      </div>
    </div>
  );
};

export default DailyView;

