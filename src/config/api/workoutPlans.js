/**
 * Workout plan API endpoints
 */

import { API_URL } from './base';

export const workoutPlanEndpoints = {
  WORKOUT_PLANS_QUESTIONNAIRE: `${API_URL}/api/workout-plans/questionnaire`,
  WORKOUT_PLANS_SUBMIT: `${API_URL}/api/workout-plans/questionnaire/submit`,
  WORKOUT_PLANS_GENERATE: `${API_URL}/api/workout-plans/generate`,
  WORKOUT_PLANS_ACTIVE: `${API_URL}/api/workout-plans/active`,
  WORKOUT_PLAN: (planId) => `${API_URL}/api/workout-plans/${planId}`,
  WORKOUT_PLAN_REGENERATE: (planId) => `${API_URL}/api/workout-plans/${planId}/regenerate`,
  WORKOUT_PLAN_DELETE: (planId) => `${API_URL}/api/workout-plans/${planId}`,
};

