/**
 * Feature Routes Configuration
 * 
 * Routes organized by feature (Analysis, Workout Plans, Expert Coaching).
 * These routes follow the feature-based organization pattern.
 */

// Analysis feature
import AnalysisHistoryPage from '../../features/analysis/pages/AnalysisHistoryPage';
import AnalysisDetailPage from '../../features/analysis/pages/AnalysisDetailPage';

// Workout Plans feature
import WorkoutPlanQuestionnairePage from '../../features/workout-plans/pages/WorkoutPlanQuestionnairePage';
import WorkoutPlanGeneratePage from '../../features/workout-plans/pages/WorkoutPlanGeneratePage';
import WorkoutPlanViewerPage from '../../features/workout-plans/pages/WorkoutPlanViewerPage';

// Expert Coaching feature
import ExpertCoachingPage from '../../features/expert-coaching/pages/ExpertCoachingPage';
import ExpertCoachingVoucherPage from '../../features/expert-coaching/pages/ExpertCoachingVoucherPage';
import ExpertCoachingRequestPage from '../../features/expert-coaching/pages/ExpertCoachingRequestPage';
import ExpertCoachingConsultationsPage from '../../features/expert-coaching/pages/ExpertCoachingConsultationsPage';
import ExpertCoachingDetailPage from '../../features/expert-coaching/pages/ExpertCoachingDetailPage';
import ExpertCoachingBookingPage from '../../features/expert-coaching/pages/ExpertCoachingBookingPage';
import PTExpertCoachingConsultationsPage from '../../features/expert-coaching/pages/PTExpertCoachingConsultationsPage';
import PTExpertCoachingDetailPage from '../../features/expert-coaching/pages/PTExpertCoachingDetailPage';

/**
 * Feature routes configuration
 * @type {Array<{path: string, element: React.Component, title?: string, requiresAuth?: boolean, feature?: string}>}
 */
export const featureRoutes = [
  // Analysis routes
  {
    path: '/analyses',
    element: AnalysisHistoryPage,
    title: 'Analysis History',
    requiresAuth: true,
    feature: 'analysis'
  },
  {
    path: '/analyses/:analysisId',
    element: AnalysisDetailPage,
    title: 'Analysis Detail',
    requiresAuth: true,
    feature: 'analysis'
  },
  
  // Workout Plans routes
  {
    path: '/workout-plans/questionnaire',
    element: WorkoutPlanQuestionnairePage,
    title: 'Workout Plan Questionnaire',
    requiresAuth: true,
    feature: 'workout-plans'
  },
  {
    path: '/workout-plans/generate',
    element: WorkoutPlanGeneratePage,
    title: 'Generate Workout Plan',
    requiresAuth: true,
    feature: 'workout-plans'
  },
  {
    path: '/workout-plans/:planId',
    element: WorkoutPlanViewerPage,
    title: 'Workout Plan',
    requiresAuth: true,
    feature: 'workout-plans'
  },
  {
    path: '/workout-plans',
    element: WorkoutPlanViewerPage,
    title: 'Workout Plans',
    requiresAuth: true,
    feature: 'workout-plans'
  },
  
  // Expert Coaching routes (User-facing)
  {
    path: '/expert-coaching',
    element: ExpertCoachingPage,
    title: 'Expert Coaching',
    requiresAuth: true,
    feature: 'expert-coaching'
  },
  {
    path: '/expert-coaching/voucher',
    element: ExpertCoachingVoucherPage,
    title: 'Expert Coaching Voucher',
    requiresAuth: true,
    feature: 'expert-coaching'
  },
  {
    path: '/expert-coaching/request',
    element: ExpertCoachingRequestPage,
    title: 'Request Consultation',
    requiresAuth: true,
    feature: 'expert-coaching'
  },
  {
    path: '/expert-coaching/consultations',
    element: ExpertCoachingConsultationsPage,
    title: 'My Consultations',
    requiresAuth: true,
    feature: 'expert-coaching'
  },
  {
    path: '/expert-coaching/consultations/:consultationId/book',
    element: ExpertCoachingBookingPage,
    title: 'Book Consultation',
    requiresAuth: true,
    feature: 'expert-coaching'
  },
  {
    path: '/expert-coaching/consultations/:consultationId',
    element: ExpertCoachingDetailPage,
    title: 'Consultation Detail',
    requiresAuth: true,
    feature: 'expert-coaching'
  },
  
  // Expert Coaching routes (PT-facing)
  {
    path: '/pt/expert-coaching/consultations',
    element: PTExpertCoachingConsultationsPage,
    title: 'PT Consultations',
    requiresAuth: true,
    feature: 'expert-coaching'
  },
  {
    path: '/pt/expert-coaching/consultations/:consultationId',
    element: PTExpertCoachingDetailPage,
    title: 'PT Consultation Detail',
    requiresAuth: true,
    feature: 'expert-coaching'
  }
];

