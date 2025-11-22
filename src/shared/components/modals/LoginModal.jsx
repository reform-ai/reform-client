import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../../config/api';
import { storeUserData } from '../../utils/authStorage';

/**
 * Login modal component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onLoginSuccess - Callback when login succeeds (optional)
 */
const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        credentials: 'include', // Important: include cookies for httpOnly token
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      if (!response.ok) {
        // Try to parse error response, but handle cases where it's not JSON
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Store user data using helper function
      storeUserData(data);

      // Clear form
      setEmail('');
      setPassword('');
      setLoginError('');
      
      // Close modal
      onClose();
      
      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      // Handle network errors and other exceptions
      let errorMessage = 'Invalid credentials. Please check your email and password.';
      
      if (err.message) {
        // If it's a network error (fetch failed), provide a more helpful message
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Load Failed')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('CORS') || err.message.includes('cross-origin')) {
          errorMessage = 'Connection error. Please try again later.';
        } else {
          // Use the error message from the server or the caught error
          errorMessage = err.message;
        }
      }
      
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      onClick={onClose}
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
            onClick={onClose}
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
          onSubmit={handleSubmit}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </label>

          {loginError && (
            <p style={{ margin: 0, color: 'var(--score-warning)', fontSize: '0.85rem' }}>{loginError}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isLoading ? 'var(--bg-tertiary)' : 'var(--score-excellent)',
              color: '#fff',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
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
            onClick={onClose}
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

