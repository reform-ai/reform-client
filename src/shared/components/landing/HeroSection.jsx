import React from 'react';
import { Link } from 'react-router-dom';
import { isUserLoggedIn } from '../../utils/authStorage';
import '../../styles/landing/LandingComponents.css';

/**
 * HeroSection - Main hero section for landing page
 * 
 * Props:
 * - onScrollToAnalysis: function - Callback when "Start Analyzing" is clicked (optional)
 */
const HeroSection = ({ onScrollToAnalysis }) => {
  const isLoggedIn = isUserLoggedIn();

  const handleStartAnalyzing = (e) => {
    if (onScrollToAnalysis) {
      e.preventDefault();
      onScrollToAnalysis();
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            AI-Powered Form Analysis <span className="hero-title-accent">for Athletes</span>
          </h1>
          <p className="hero-subtitle">
            Upload your workout video and get instant, detailed form analysis. 
            Track your progress, improve your technique, and reach your fitness goals faster.
          </p>
          <div className="hero-actions">
            {isLoggedIn ? (
              <Link to="/dashboard" className="hero-btn hero-btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <button 
                className="hero-btn hero-btn-primary"
                onClick={handleStartAnalyzing}
              >
                Start Analyzing
              </button>
            )}
          </div>
          <p className="hero-note">
            No signup required • 100% free to try
          </p>
        </div>
        <div className="hero-placeholder-card">
          {/* Empty placeholder card for future content */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

