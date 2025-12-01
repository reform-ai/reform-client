import React from 'react';
import FeatureCard from './FeatureCard';
import '../../styles/landing/LandingComponents.css';

/**
 * FeaturesGrid - Grid of feature cards
 * 
 * Props:
 * - onScrollToAnalysis: function - Callback when "Try Analysis" is clicked (optional)
 */
const FeaturesGrid = ({ onScrollToAnalysis }) => {
  const handleTryAnalysis = (e) => {
    if (onScrollToAnalysis) {
      e.preventDefault();
      onScrollToAnalysis();
    }
  };

  return (
    <section className="features-section">
      <div className="features-container">
        <h2 className="features-title">All-in-One AI Fitness Platform</h2>
        <p className="features-subtitle">
          Everything you need to achieve your fitness goals
        </p>
        <div className="features-grid">
          <FeatureCard
            icon="🎯"
            title="AI Form Analysis"
            description="Upload your workout video and get instant, detailed form breakdown with scores for torso angle, quad angle, asymmetry, and more."
            ctaText="Try Analysis"
            ctaOnClick={handleTryAnalysis}
          />
          <FeatureCard
            icon="📋"
            title="Personalized Workout Plans"
            description="Get AI-generated workout plans tailored to your goals, fitness level, and preferences. Track your progress over time."
            ctaText="Create Plan"
            ctaLink="/workout-plans/questionnaire"
          />
          <FeatureCard
            icon="💬"
            title="Expert Coaching"
            description="Get personalized guidance and answers from AI personal trainers. Ask questions, get form tips, and receive expert advice."
            ctaText="Learn More"
            comingSoon={true}
            disabled={true}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;

