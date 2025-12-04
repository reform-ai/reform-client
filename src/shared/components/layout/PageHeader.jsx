import React from 'react';
import ProfileMenu from '../ProfileMenu';
import { isUserLoggedIn } from '../../utils/authStorage';

/**
 * PageHeader - Common page header component with authentication-aware UI
 * 
 * Displays the application header with title, profile menu (when logged in),
 * and appropriate action buttons (Dashboard for logged-in users, Login for guests).
 * Automatically adapts its appearance based on authentication status.
 * 
 * @param {Object} props
 * @param {Function} props.onLoginClick - Callback function invoked when Login button is clicked
 * 
 * @returns {JSX.Element} Header component with title and action buttons
 * 
 * @example
 * <PageHeader onLoginClick={() => setShowLoginModal(true)} />
 * 
 * @see {@link ProfileMenu} for the profile menu component
 * @see {@link authStorage.isUserLoggedIn} for authentication check
 */
const PageHeader = ({ onLoginClick }) => {
  const isLoggedIn = isUserLoggedIn();
  const headerClassNames = ['page-header'];
  if (!isLoggedIn) {
    headerClassNames.push('page-header--anonymous');
  } else {
    headerClassNames.push('page-header--authenticated');
  }

  return (
    <div
      className={headerClassNames.join(' ')}
      style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '12px', width: '100%' }}
    >
      <h1 className="app-header header-title" style={{
        fontWeight: 700,
        color: 'var(--text-primary)',
        margin: 0,
        flexGrow: 1
      }}>
        Reform - Exercise Analyzer
      </h1>
      <div
        className="header-actions"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
      >
        {isLoggedIn && <ProfileMenu />}
        {isLoggedIn ? (
          <a
            className="header-cta"
            href="/dashboard"
            style={{
              padding: '8px 12px',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <span role="img" aria-label="dashboard" style={{ fontSize: '1.1rem' }}>📊</span>
            <span className="header-cta__label">Dashboard</span>
          </a>
        ) : (
          <button
            className="header-cta"
            onClick={onLoginClick}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <span role="img" aria-label="login" style={{ fontSize: '1.1rem' }}>🔐</span>
            <span className="header-cta__label">Login</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

