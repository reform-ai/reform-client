import React from 'react';
import AnalysisSectionHeader from '../components/analysis/AnalysisSectionHeader';
import AnalysisUploader from '../components/analysis/AnalysisUploader';
import '../styles/AnalysisSkeleton.css';

/**
 * AnalysisSkeleton - A reusable component for video upload and analysis with dashboard-style visuals
 * 
 * This component is now a wrapper that combines AnalysisSectionHeader and AnalysisUploader
 * for backward compatibility. It maintains the same props interface.
 * 
 * Props:
 * - showNotes: boolean - Whether to show the notes textarea (default: false)
 * - syncCardHeights: boolean - Whether to sync heights of left/right cards (default: false)
 * - headerTitle: string - Title for the header section (default: "Upload a Session")
 * - headerSubtitle: string - Subtitle for the header section
 * - onAnalysisComplete: function - Callback when analysis completes (optional)
 * - onSignInClick: function - Callback when sign in button is clicked (optional)
 */
const AnalysisSkeleton = ({
  showNotes = false,
  syncCardHeights = false,
  headerTitle = "Upload a Session",
  headerSubtitle = null, // If null, will use default based on login status
  onAnalysisComplete = null,
  onSignInClick = null
}) => {
  return (
    <div className="skeleton-shell">
      <AnalysisSectionHeader
        eyebrow="New Analysis"
        title={headerTitle}
        subtitle={headerSubtitle}
      />
      <AnalysisUploader
        showNotes={showNotes}
        syncCardHeights={syncCardHeights}
        onAnalysisComplete={onAnalysisComplete}
        onSignInClick={onSignInClick}
      />
    </div>
  );
};

export default AnalysisSkeleton;
