/**
 * Workout Plans Feature - Main Export
 * 
 * This module provides a centralized export point for all workout-plans
 * related components and pages.
 * 
 * Usage:
 *   import { WorkoutCalendar, WorkoutPlanViewerPage } from '../features/workout-plans';
 */

// Components
export { default as WorkoutCalendar } from './components/WorkoutCalendar';
export { default as DailyView } from './components/DailyView';
export { default as WeeklyView } from './components/WeeklyView';
export { default as ViewModeSelector } from './components/ViewModeSelector';

// Pages
export { default as WorkoutPlanQuestionnairePage } from './pages/WorkoutPlanQuestionnairePage';
export { default as WorkoutPlanGeneratePage } from './pages/WorkoutPlanGeneratePage';
export { default as WorkoutPlanViewerPage } from './pages/WorkoutPlanViewerPage';

