import React from 'react';
import ProfileMenu from '../ProfileMenu';
import { isUserLoggedIn } from '../../utils/authStorage';

/**
 * Common page header component used across multiple pages
 * Displays title, ProfileMenu (if logged in), and Dashboard/Login button
 * 
 * @param {Object} props
 * @param {Function} props.onLoginClick - Callback when Login button is clicked
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

