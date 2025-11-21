import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DashboardAnalyze from './pages/DashboardAnalyze';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import FeedPage from './pages/FeedPage';
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
        <Route path="/feed" element={<FeedPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

