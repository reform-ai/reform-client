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
import AnalysisHistoryPage from './pages/AnalysisHistoryPage';
import AnalysisDetailPage from './pages/AnalysisDetailPage';
import ProgressDashboardPage from './pages/ProgressDashboardPage';
import XOAuthCallbackPage from './pages/XOAuthCallbackPage';
import WorkoutPlanQuestionnairePage from './pages/WorkoutPlanQuestionnairePage';
import WorkoutPlanGeneratePage from './pages/WorkoutPlanGeneratePage';
import WorkoutPlanViewerPage from './pages/WorkoutPlanViewerPage';
import ExpertCoachingPage from './pages/ExpertCoachingPage';
import ExpertCoachingRequestPage from './pages/ExpertCoachingRequestPage';
import ExpertCoachingConsultationsPage from './pages/ExpertCoachingConsultationsPage';
import ExpertCoachingDetailPage from './pages/ExpertCoachingDetailPage';
import PTExpertCoachingConsultationsPage from './pages/PTExpertCoachingConsultationsPage';
import PTExpertCoachingDetailPage from './pages/PTExpertCoachingDetailPage';
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
        <Route path="/expert-coaching/request" element={<ExpertCoachingRequestPage />} />
        <Route path="/expert-coaching/consultations" element={<ExpertCoachingConsultationsPage />} />
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

