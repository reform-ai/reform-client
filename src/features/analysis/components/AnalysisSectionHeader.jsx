import React from 'react';
import { isUserLoggedIn } from '../../../shared/utils/authStorage';
import '../../styles/AnalysisSkeleton.css';

/**
 * AnalysisSectionHeader - Reusable header component for analysis sections
 * 
 * Props:
 * - eyebrow: string - Eyebrow text (default: "New Analysis")
 * - title: string - Main title (default: "Upload a Session")
 * - subtitle: string | null - Subtitle text (if null, uses default based on login status)
 * - className: string - Additional CSS classes for the header element
 */
const AnalysisSectionHeader = ({
  eyebrow = "New Analysis",
  title = "Upload a Session",
  subtitle = null,
  className = ""
}) => {
  const isLoggedIn = isUserLoggedIn();
  
  // Default subtitles based on login status
  const defaultAnonymousSubtitle = "Select your exercise type and upload a video. Kick off the AI-powered analysis pipeline optimized for Reform athletes.";
  const defaultLoggedInSubtitle = "Select your exercise type, upload a video, and include any coaching notes. Kick off the AI-powered analysis pipeline optimized for Reform athletes.";
  
  // Use provided subtitle or default based on login status
  const displaySubtitle = subtitle !== null 
    ? subtitle 
    : (isLoggedIn ? defaultLoggedInSubtitle : defaultAnonymousSubtitle);

  return (
    <header className={`skeleton-header ${className}`.trim()}>
      <div>
        <p className="skeleton-eyebrow">{eyebrow}</p>
        <h1 className="skeleton-title">{title}</h1>
        <p className="skeleton-subtitle">{displaySubtitle}</p>
      </div>
    </header>
  );
};

export default AnalysisSectionHeader;

