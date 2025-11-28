import React, { useState, useEffect } from 'react';
import { parseUTCDate } from '../../utils/dateFormat';
import './WorkoutCalendar.css';

/**
 * Calendar component for selecting workout days across multiple weeks
 * @param {Object} props
 * @param {Array} props.weeks - Array of week objects from plan data
 * @param {Set} props.selectedDays - Set of date strings (YYYY-MM-DD) that are selected
 * @param {Function} props.onDayToggle - Callback when a day is clicked (dateString) => void
 */
const WorkoutCalendar = ({ weeks, selectedDays, onDayToggle }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allWorkoutDays, setAllWorkoutDays] = useState(new Set());

  // Calculate workout date from week start_date and workout day (1-7, where 1=Monday)
  const calculateWorkoutDate = React.useCallback((weekStartDate, day) => {
    if (!weekStartDate || !day) return null;
    const start = parseUTCDate(weekStartDate);
    if (!start) return null;
    
    // day is 1-7 where 1=Monday, 2=Tuesday, etc.
    // JavaScript Date.getDay() returns 0=Sunday, 1=Monday, etc.
    // So we need to convert: day 1 (Monday) = weekday 1, day 7 (Sunday) = weekday 0
    const targetWeekday = day === 7 ? 0 : day; // Sunday is 0 in JS, 7 in our system
    
    // Find the date of the target weekday in the week containing start_date
    const startWeekday = start.getDay();
    const daysDiff = (targetWeekday - startWeekday + 7) % 7;
    const workoutDate = new Date(start);
    workoutDate.setDate(start.getDate() + daysDiff);
    
    return workoutDate;
  }, []);

  // Extract all workout days from plan data
  useEffect(() => {
    if (!weeks || weeks.length === 0) {
      setAllWorkoutDays(new Set());
      return;
    }

    const workoutDays = new Set();
    try {
      weeks.forEach(week => {
        if (week && week.start_date && week.workouts) {
          week.workouts.forEach(workout => {
            if (workout && workout.day) {
              const workoutDate = calculateWorkoutDate(week.start_date, workout.day);
              if (workoutDate) {
                const dateString = workoutDate.toISOString().split('T')[0];
                workoutDays.add(dateString);
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Error extracting workout days:', error);
    }
    setAllWorkoutDays(workoutDays);
  }, [weeks, calculateWorkoutDate]);

  // Get first and last dates from plan
  const getPlanDateRange = () => {
    if (!weeks || weeks.length === 0) return null;
    
    const firstWeek = weeks[0];
    const lastWeek = weeks[weeks.length - 1];
    
    if (!firstWeek || !lastWeek) return null;
    
    const startDate = firstWeek.start_date ? parseUTCDate(firstWeek.start_date) : null;
    const endDate = lastWeek.end_date ? parseUTCDate(lastWeek.end_date) : null;
    
    return { startDate, endDate };
  };

  // Initialize current month to plan start date
  useEffect(() => {
    const range = getPlanDateRange();
    if (range && range.startDate) {
      setCurrentMonth(new Date(range.startDate));
    }
  }, [weeks]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDayClick = (date) => {
    if (!date) return;
    const dateString = date.toISOString().split('T')[0];
    onDayToggle(dateString);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isWorkoutDay = (date) => {
    if (!date) return false;
    const dateString = date.toISOString().split('T')[0];
    return allWorkoutDays.has(dateString);
  };

  const isSelected = (date) => {
    if (!date) return false;
    const dateString = date.toISOString().split('T')[0];
    return selectedDays.has(dateString);
  };

  const isRestDay = (date) => {
    if (!date) return false;
    const dateString = date.toISOString().split('T')[0];
    // Check if this date is in any week but not a workout day
    const range = getPlanDateRange();
    if (!range || !range.startDate || !range.endDate) return false;
    
    const dateTime = date.getTime();
    const startTime = range.startDate.getTime();
    const endTime = range.endDate.getTime();
    
    return dateTime >= startTime && dateTime <= endTime && !isWorkoutDay(date);
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedCount = selectedDays.size;

  return (
    <div className="workout-calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="calendar-nav-button">‹</button>
        <h3 className="calendar-month">{monthName}</h3>
        <button onClick={handleNextMonth} className="calendar-nav-button">›</button>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
        
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="calendar-day empty"></div>;
          }
          
          const dateString = date.toISOString().split('T')[0];
          const isToday = dateString === new Date().toISOString().split('T')[0];
          const isWorkout = isWorkoutDay(date);
          const isRest = isRestDay(date);
          const isSelectedDay = isSelected(date);
          
          return (
            <div
              key={dateString}
              className={`calendar-day ${isSelectedDay ? 'selected' : ''} ${isWorkout ? 'workout' : ''} ${isRest ? 'rest' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => handleDayClick(date)}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
      
      <div className="calendar-footer">
        <div className="selected-count">{selectedCount} day{selectedCount !== 1 ? 's' : ''} selected</div>
        <div className="calendar-legend">
          <span className="legend-item">
            <span className="legend-color workout"></span>
            Workout
          </span>
          <span className="legend-item">
            <span className="legend-color rest"></span>
            Rest
          </span>
          <span className="legend-item">
            <span className="legend-color selected"></span>
            Selected
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;

