import React, { useState, useEffect } from 'react';
import ProfileMenu from '../shared/components/ProfileMenu';
import AnalysisSkeleton from '../shared/components/AnalysisSkeleton';
import { API_ENDPOINTS } from '../config/api';
import './DashboardAnalyze.css';

// Demo credentials removed for security - use real authentication only

function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === '1') {
      setShowLoginModal(true);
      params.delete('login');
      const newSearch = params.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return (
    <div className="App" style={{ 
      minHeight: '100vh', 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '12px' }}>
        <h1 className="app-header" style={{ 
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0
        }}>
          Reform - Exercise Analyzer
        </h1>
        {isLoggedIn && (
          <ProfileMenu />
        )}
        {isLoggedIn ? (
          <a
            href="/dashboard/index.html"
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <span role="img" aria-label="dashboard" style={{ fontSize: '1.1rem' }}>📊</span>
            Dashboard
          </a>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <span role="img" aria-label="login" style={{ fontSize: '1.1rem' }}>🔐</span>
            Login
          </button>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <AnalysisSkeleton
          showNotes={false}
          syncCardHeights={true}
          headerTitle="Upload a Session"
          headerSubtitle="Select your exercise type, upload a video, and include any coaching notes. Kick off the AI-powered analysis pipeline optimized for Reform athletes."
          onSignInClick={() => setShowLoginModal(true)}
        />
      </div>

      {showLoginModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowLoginModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '30px',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              border: '1px solid var(--border-color)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Sign in to Reform</h3>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1.25rem',
                  cursor: 'pointer'
                }}
                aria-label="Close login modal"
              >
                ×
              </button>
            </div>

            <form
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginError('');

                // API login
                try {
                  const response = await fetch(API_ENDPOINTS.LOGIN, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      email: email.trim(),
                      password: password
                    })
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.detail || 'Login failed');
                  }

                  // Store token and user info
                  localStorage.setItem('userToken', data.access_token);
                  localStorage.setItem('access_token', data.access_token);
                  localStorage.setItem('userId', data.user_id);
                  localStorage.setItem('user_id', data.user_id);
                  localStorage.setItem('userEmail', data.email);
                  localStorage.setItem('user_email', data.email);
                  localStorage.setItem('userName', data.full_name);
                  localStorage.setItem('user_name', data.full_name);
                  // Parse full_name to extract first and last name for login
                  const nameParts = data.full_name.trim().split(/\s+/);
                  if (nameParts.length >= 2) {
                    localStorage.setItem('firstName', nameParts[0]);
                    localStorage.setItem('lastName', nameParts.slice(1).join(' '));
                  } else if (nameParts.length === 1) {
                    localStorage.setItem('firstName', nameParts[0]);
                    localStorage.setItem('lastName', '');
                  }
                  localStorage.setItem('isLoggedIn', 'true');

                  setIsLoggedIn(true);
                  setShowLoginModal(false);
                  setEmail('');
                  setPassword('');
                  
                  // Redirect to dashboard after successful login
                  window.location.href = '/dashboard/index.html';
                } catch (err) {
                  setLoginError(err.message || 'Invalid credentials. Please check your email and password.');
                }
              }}
            >
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                Email
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                Password
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </label>

              {loginError && (
                <p style={{ margin: 0, color: 'var(--score-warning)', fontSize: '0.85rem' }}>{loginError}</p>
              )}

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--score-excellent)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <p style={{ margin: '5px 0' }}>New to Reform?</p>
              <a
                href="/signup"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
                onClick={() => setShowLoginModal(false)}
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
