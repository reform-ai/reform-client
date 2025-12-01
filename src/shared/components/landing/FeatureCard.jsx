import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/landing/LandingComponents.css';

/**
 * FeatureCard - Reusable feature card component
 * 
 * Props:
 * - icon: string - Emoji or icon to display
 * - title: string - Feature title
 * - description: string - Feature description
 * - ctaText: string - Call-to-action button text
 * - ctaLink: string - Link for CTA button (optional)
 * - ctaOnClick: function - Click handler for CTA (optional)
 * - comingSoon: boolean - Show "Coming Soon" badge (default: false)
 * - disabled: boolean - Disable the CTA button (default: false)
 */
const FeatureCard = ({
  icon,
  title,
  description,
  ctaText,
  ctaLink = null,
  ctaOnClick = null,
  comingSoon = false,
  disabled = false
}) => {
  const renderCTA = () => {
    if (disabled || comingSoon) {
      return (
        <button className="feature-cta" disabled>
          {comingSoon ? 'Coming Soon' : ctaText}
        </button>
      );
    }

    if (ctaOnClick) {
      return (
        <button className="feature-cta" onClick={ctaOnClick}>
          {ctaText}
        </button>
      );
    }

    if (ctaLink) {
      return (
        <Link to={ctaLink} className="feature-cta">
          {ctaText}
        </Link>
      );
    }

    return (
      <button className="feature-cta" disabled>
        {ctaText}
      </button>
    );
  };

  return (
    <div className="feature-card">
      {comingSoon && (
        <div className="feature-badge">Coming Soon</div>
      )}
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      {renderCTA()}
    </div>
  );
};

export default FeatureCard;

