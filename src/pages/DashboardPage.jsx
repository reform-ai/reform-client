import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../shared/components/PageHeader';
import PageContainer from '../shared/components/PageContainer';
import '../shared/components/AnalysisSkeletonV2.css';
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <PageContainer>
      <PageHeader onLoginClick={() => window.location.href = '/?login=1'} />
      
      <div className="skeleton-v2-shell">
        <header className="skeleton-v2-header">
          <div>
            <p className="skeleton-v2-eyebrow">Dashboard Preview</p>
            <h1 className="skeleton-v2-title">Welcome back, Athlete</h1>
            <p className="skeleton-v2-subtitle">Review your latest analysis, monitor trends, and share standout moments with your coach or community.</p>
          </div>
          <div className="hero-actions">
            <Link to="/dashboard/analyze" className="btn-primary">Run New Analysis</Link>
          </div>
        </header>

        <div className="skeleton-v2-grid">
          <article className="skeleton-v2-card">
            <h3>Most Recent Analysis</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Coming soon</p>
          </article>

          <article className="skeleton-v2-card">
            <h3>Community Feed</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Connect with the community and share your progress
            </p>
            <Link 
              to="/feed" 
              className="btn btn-view-feed"
              style={{ 
                display: 'inline-block',
                background: 'transparent',
                border: '1px solid var(--accent-green)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                fontSize: '0.9rem'
              }}
            >
              View Feed
            </Link>
          </article>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;

