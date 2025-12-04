import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DashboardAnalyze from './pages/DashboardAnalyze';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import FeedPage from './pages/FeedPage';
import FollowersPage from './pages/FollowersPage';
import TokensPage from './pages/TokensPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
// Analysis feature - using feature-based organization
import AnalysisHistoryPage from './features/analysis/pages/AnalysisHistoryPage';
import AnalysisDetailPage from './features/analysis/pages/AnalysisDetailPage';
import ProgressDashboardPage from './pages/ProgressDashboardPage';
import XOAuthCallbackPage from './pages/XOAuthCallbackPage';
// Workout Plans feature - using feature-based organization
import WorkoutPlanQuestionnairePage from './features/workout-plans/pages/WorkoutPlanQuestionnairePage';
import WorkoutPlanGeneratePage from './features/workout-plans/pages/WorkoutPlanGeneratePage';
import WorkoutPlanViewerPage from './features/workout-plans/pages/WorkoutPlanViewerPage';
// Expert Coaching feature - using feature-based organization
import ExpertCoachingPage from './features/expert-coaching/pages/ExpertCoachingPage';
import ExpertCoachingVoucherPage from './features/expert-coaching/pages/ExpertCoachingVoucherPage';
import ExpertCoachingRequestPage from './features/expert-coaching/pages/ExpertCoachingRequestPage';
import ExpertCoachingConsultationsPage from './features/expert-coaching/pages/ExpertCoachingConsultationsPage';
import ExpertCoachingDetailPage from './features/expert-coaching/pages/ExpertCoachingDetailPage';
import ExpertCoachingBookingPage from './features/expert-coaching/pages/ExpertCoachingBookingPage';
import PTExpertCoachingConsultationsPage from './features/expert-coaching/pages/PTExpertCoachingConsultationsPage';
import PTExpertCoachingDetailPage from './features/expert-coaching/pages/PTExpertCoachingDetailPage';
import Footer from './shared/components/layout/Footer';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/analyze" element={<DashboardAnalyze />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:username" element={<UserProfilePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/followers" element={<FollowersPage />} />
        <Route path="/tokens" element={<TokensPage />} />
        <Route path="/tokens/history" element={<TransactionHistoryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/analyses" element={<AnalysisHistoryPage />} />
        <Route path="/analyses/:analysisId" element={<AnalysisDetailPage />} />
        <Route path="/progress" element={<ProgressDashboardPage />} />
        <Route path="/auth/x/callback" element={<XOAuthCallbackPage />} />
        <Route path="/workout-plans/questionnaire" element={<WorkoutPlanQuestionnairePage />} />
        <Route path="/workout-plans/generate" element={<WorkoutPlanGeneratePage />} />
        <Route path="/workout-plans/:planId" element={<WorkoutPlanViewerPage />} />
        <Route path="/workout-plans" element={<WorkoutPlanViewerPage />} />
        <Route path="/expert-coaching" element={<ExpertCoachingPage />} />
        <Route path="/expert-coaching/voucher" element={<ExpertCoachingVoucherPage />} />
        <Route path="/expert-coaching/request" element={<ExpertCoachingRequestPage />} />
        <Route path="/expert-coaching/consultations" element={<ExpertCoachingConsultationsPage />} />
        <Route path="/expert-coaching/consultations/:consultationId/book" element={<ExpertCoachingBookingPage />} />
        <Route path="/expert-coaching/consultations/:consultationId" element={<ExpertCoachingDetailPage />} />
        <Route path="/pt/expert-coaching/consultations" element={<PTExpertCoachingConsultationsPage />} />
        <Route path="/pt/expert-coaching/consultations/:consultationId" element={<PTExpertCoachingDetailPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

