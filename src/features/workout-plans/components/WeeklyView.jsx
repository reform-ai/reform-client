import React, { useState, useEffect, useRef } from 'react';
import { parseUTCDate } from '../../../shared/utils/dateFormat';
import './WeeklyView.css';

/**
 * Weekly view component - shows week summary with expandable days
 * @param {Object} props
 * @param {Array} props.selectedDays - Set of date strings (YYYY-MM-DD) that are selected
 * @param {Object} props.planData - Plan data object
 * @param {number} props.currentWeekIndex - Current week index
 * @param {Function} props.onWeekChange - Callback when week changes (weekIndex) => void
 */
const WeeklyView = ({ selectedDays, planData, currentWeekIndex, onWeekChange }) => {
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [restSuggestionsVisible, setRestSuggestionsVisible] = useState({});
  const weekRef = useRef(null);

  const weeks = planData?.weeks || [];
  const currentWeek = weeks[currentWeekIndex];

  // Calculate workout date from week start_date and workout day (1-7, where 1=Monday)
  // Must be defined before useEffect that uses it
  const calculateWorkoutDate = React.useCallback((weekStartDate, day) => {
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
  }, []);

  // Auto-scroll to first selected day when week changes
  useEffect(() => {
    if (weekRef.current && currentWeek && currentWeek.start_date) {
      // Find first selected day in current week
      const firstSelectedDay = currentWeek.workouts.find(workout => {
        if (!workout.day) return false;
        const workoutDate = calculateWorkoutDate(currentWeek.start_date, workout.day);
        if (!workoutDate) return false;
        const dateString = workoutDate.toISOString().split('T')[0];
        return selectedDays.has(dateString);
      });

      if (firstSelectedDay && currentWeek.start_date) {
        const workoutDate = calculateWorkoutDate(currentWeek.start_date, firstSelectedDay.day);
        if (workoutDate) {
          const dateString = workoutDate.toISOString().split('T')[0];
          setTimeout(() => {
            const dayElement = document.querySelector(`[data-day-date="${dateString}"]`);
            if (dayElement) {
              dayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 100);
        }
      }
    }
  }, [currentWeekIndex, currentWeek, selectedDays, calculateWorkoutDate]);

  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) {
      onWeekChange(currentWeekIndex - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      onWeekChange(currentWeekIndex + 1);
    }
  };

  const handleJumpToWeek = (weekIndex) => {
    if (weekIndex >= 0 && weekIndex < weeks.length) {
      onWeekChange(weekIndex);
    }
  };

  const toggleDayExpanded = (dateString) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateString)) {
        newSet.delete(dateString);
      } else {
        newSet.add(dateString);
      }
      return newSet;
    });
  };

  const toggleRestSuggestions = (dateString) => {
    setRestSuggestionsVisible(prev => ({
      ...prev,
      [dateString]: !prev[dateString]
    }));
  };

  const isDaySelected = (workout, weekStartDate) => {
    if (!workout.day || !weekStartDate) return false;
    const workoutDate = calculateWorkoutDate(weekStartDate, workout.day);
    if (!workoutDate) return false;
    const dateString = workoutDate.toISOString().split('T')[0];
    return selectedDays.has(dateString);
  };

  const formatDayDate = (dateString) => {
    const date = parseUTCDate(dateString);
    if (!date) return '';
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRestDaySuggestions = () => {
    return [
      'Light stretching (10-15 min)',
      'Walking or gentle movement',
      'Focus on recovery and hydration',
      'Consider foam rolling or massage'
    ];
  };

  if (!currentWeek || !weeks || weeks.length === 0) {
    return (
      <div className="weekly-view-empty">
        <p>No week data available.</p>
      </div>
    );
  }

  if (!currentWeek.start_date) {
    return (
      <div className="weekly-view-empty">
        <p>Week data is missing start date.</p>
      </div>
    );
  }

  // Create week view - Week 1 shows from start_date to Sunday, Week 2+ shows all 7 days
  const weekDays = [];
  const weekStart = parseUTCDate(currentWeek.start_date);
  const weekEnd = parseUTCDate(currentWeek.end_date);
  
  if (weekStart) {
    if (currentWeek.week_number === 1) {
      // Week 1: Show from start_date to Sunday of that week
      const daysUntilSunday = (6 - weekStart.getDay() + 7) % 7;
      const sunday = new Date(weekStart);
      sunday.setDate(weekStart.getDate() + daysUntilSunday);
      
      let currentDate = new Date(weekStart);
      while (currentDate <= sunday) {
        const dateString = currentDate.toISOString().split('T')[0];
        const targetDay = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // Convert to 1-7 format
        const workout = currentWeek.workouts.find(w => w.day === targetDay);
        
        weekDays.push({
          date: new Date(currentDate),
          dateString,
          workout,
          isSelected: selectedDays.has(dateString)
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // Week 2+: Show all 7 days (Monday-Sunday)
      // Find Monday of the week
      const monday = new Date(weekStart);
      const dayOfWeek = monday.getDay();
      const diff = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      monday.setDate(diff);
      
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + i);
        const dateString = dayDate.toISOString().split('T')[0];
        
        // Find workout for this day (day is 1-7 where 1=Monday, 7=Sunday)
        const targetDay = dayDate.getDay() === 0 ? 7 : dayDate.getDay();
        const workout = currentWeek.workouts.find(w => w.day === targetDay);
        
        weekDays.push({
          date: dayDate,
          dateString,
          workout,
          isSelected: selectedDays.has(dateString)
        });
      }
    }
  }

  return (
    <div className="weekly-view" ref={weekRef}>
      <div className="week-navigation">
        <button
          onClick={handlePreviousWeek}
          className="nav-button prev"
          disabled={currentWeekIndex === 0}
        >
          ◀ Previous Week
        </button>
        <div className="current-week-info">
          <h3 className="current-week-title">
            Week {currentWeek.week_number}
            {currentWeek.date_range && `: ${currentWeek.date_range}`}
          </h3>
          <div className="week-jump">
            <label htmlFor="week-jump-select">Jump to: </label>
            <select
              id="week-jump-select"
              value={currentWeekIndex}
              onChange={(e) => handleJumpToWeek(parseInt(e.target.value))}
              className="week-jump-select"
            >
              {weeks.map((week, index) => (
                <option key={week.week_number} value={index}>
                  Week {week.week_number}
                  {week.date_range && ` (${week.date_range})`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleNextWeek}
          className="nav-button next"
          disabled={currentWeekIndex === weeks.length - 1}
        >
          Next Week ▶
        </button>
      </div>

      <div className="week-content">
        {weekDays.map((dayData, index) => {
          const { date, dateString, workout, isSelected } = dayData;
          const isRestDay = !workout || workout.focus === 'Rest Day' || workout.exercises.length === 0;
          const isExpanded = expandedDays.has(dateString);
          const showSuggestions = restSuggestionsVisible[dateString];

          return (
            <div
              key={dateString}
              className={`day-card ${isRestDay ? 'rest-day' : 'workout-day'} ${isSelected ? 'selected' : ''}`}
              data-day-date={dateString}
            >
              <div className="day-card-header">
                <div className="day-info">
                  <h4 className="day-name">{formatDayDate(dateString)}</h4>
                  {!isRestDay && (
                    <>
                      <p className="day-focus">{workout.focus}</p>
                      {workout.estimated_duration_minutes && (
                        <p className="day-duration">~{workout.estimated_duration_minutes} min</p>
                      )}
                    </>
                  )}
                  {isRestDay && (
                    <p className="day-focus rest">Rest Day</p>
                  )}
                </div>
                {!isRestDay && (
                  <button
                    onClick={() => toggleDayExpanded(dateString)}
                    className="expand-button"
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                )}
                {isRestDay && (
                  <button
                    onClick={() => toggleRestSuggestions(dateString)}
                    className="suggestions-button"
                  >
                    {showSuggestions ? 'Hide' : 'Show'} Suggestions
                  </button>
                )}
              </div>

              {isRestDay && showSuggestions && (
                <div className="rest-suggestions">
                  <ul>
                    {getRestDaySuggestions().map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!isRestDay && isExpanded && (
                <div className="day-details">
                  <div className="exercises-list">
                    {workout.exercises.map((exercise, exerciseIndex) => (
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
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyView;

