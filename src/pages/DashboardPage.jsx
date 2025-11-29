import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../shared/components/layout/PageHeader';
import PageContainer from '../shared/components/layout/PageContainer';
import '../shared/styles/AnalysisSkeleton.css';
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <PageContainer>
      <PageHeader onLoginClick={() => window.location.href = '/?login=1'} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">Dashboard Preview</p>
            <h1 className="skeleton-title">Welcome back, Athlete</h1>
            <p className="skeleton-subtitle">Review your latest analysis, monitor trends, and share standout moments with your coach or community.</p>
          </div>
          <div className="hero-actions">
            <Link to="/dashboard/analyze" className="btn-primary">Run New Analysis</Link>
          </div>
        </header>

        <div className="skeleton-grid">
          <article className="skeleton-card">
            <h3>Most Recent Analysis</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Coming soon</p>
          </article>

          <article className="skeleton-card">
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

