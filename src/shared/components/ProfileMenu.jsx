import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { getUserToken, clearUserData, isUserLoggedIn } from '../utils/authStorage';
import { authenticatedFetchJson } from '../utils/authenticatedFetch';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tokensRemaining, setTokensRemaining] = useState(null);
  const menuRef = useRef(null);
  const intervalRef = useRef(null);

  // Get user initials from localStorage
  const getUserInitials = () => {
    // Try to get first_name and last_name separately (preferred)
    const firstName = localStorage.getItem('firstName') || '';
    const lastName = localStorage.getItem('lastName') || '';
    
    if (firstName && lastName) {
      // Use first letter of first name + first letter of last name
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    
    // Fallback: try to extract from full name
    const userName = localStorage.getItem('userName') || localStorage.getItem('user_name') || '';
    if (userName) {
      const parts = userName.trim().split(/\s+/);
      if (parts.length >= 2) {
        // First letter of first name + first letter of last name
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      } else if (parts.length === 1) {
        // Only one name, use first two letters
        return parts[0].substring(0, 2).toUpperCase();
      }
    }
    
    return 'U'; // Default to 'U' if no name found
  };

  // Fetch token count from API
  const fetchTokens = async () => {
    // Only fetch if user is logged in
    if (!isUserLoggedIn()) {
      // Stop interval if user is not logged in
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTokensRemaining(null);
      return;
    }

    try {
      // Use authenticatedFetchJson which handles token refresh automatically
      // Pass null for navigate to prevent redirects, but allow token refresh
      const data = await authenticatedFetchJson(API_ENDPOINTS.ME, {}, null);
      if (data && data.tokens_remaining !== undefined) {
        setTokensRemaining(data.tokens_remaining);
      }
    } catch (error) {
      // If 401 after refresh attempt, user is logged out - stop the interval
      // authenticatedFetchJson will try to refresh, so if it still fails, user is logged out
      if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setTokensRemaining(null);
      }
      // Silently fail for other errors - tokens will just not show
      // Don't log to console to avoid noise
    }
  };

  useEffect(() => {
    // Only set up token fetching if user is logged in
    if (isUserLoggedIn()) {
      fetchTokens();
      
      // Listen for token updates from analysis completion
      const handleTokensUpdated = (event) => {
        if (event.detail?.tokens_remaining !== undefined) {
          setTokensRemaining(event.detail.tokens_remaining);
        }
      };
      
      window.addEventListener('tokensUpdated', handleTokensUpdated);
      
      // Refresh tokens every 30 seconds
      intervalRef.current = setInterval(() => {
        // Check if still logged in before fetching
        if (isUserLoggedIn()) {
          fetchTokens();
        } else {
          // Stop interval if user logged out
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 30000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        window.removeEventListener('tokensUpdated', handleTokensUpdated);
      };
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLogout = () => {
    // Clear all auth-related data using helper function
    clearUserData();
    // Close the menu before redirecting
    setIsOpen(false);
    // Redirect to landing page
    window.location.href = '/';
  };

  return (
    <div 
      ref={menuRef}
      className="profile-menu"
      style={{ position: 'relative' }}
    >
      <button
        className="profile-trigger"
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '8px 14px',
          border: '1px solid var(--border-color)',
          borderRadius: '999px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--accent-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: 600
        }}>{getUserInitials()}</span>
        <span style={{ fontSize: '0.75rem' }}>▾</span>
      </button>
      {isOpen && (
        <div
          className="menu-list"
          role="menu"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'rgba(5, 8, 18, 0.95)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '160px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
        >
          <a
            href="/profile"
            role="menuitem"
            style={{
              textDecoration: 'none',
              color: 'var(--text-primary)',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textAlign: 'left',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              window.location.href = '/profile';
            }}
          >
            Profile
          </a>
          <a
            href="/feed"
            role="menuitem"
            style={{
              textDecoration: 'none',
              color: 'var(--text-primary)',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textAlign: 'left',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              window.location.href = '/feed';
            }}
          >
            Social Feed
          </a>
          <a
            href="/analyses"
            role="menuitem"
            style={{
              textDecoration: 'none',
              color: 'var(--text-primary)',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textAlign: 'left',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              window.location.href = '/analyses';
            }}
          >
            History
          </a>
          <a
            href="/followers"
            role="menuitem"
            style={{
              textDecoration: 'none',
              color: 'var(--text-primary)',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textAlign: 'left',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              window.location.href = '/followers';
            }}
          >
            Followers
          </a>
          <a
            href="/tokens"
            role="menuitem"
            style={{
              textDecoration: 'none',
              color: 'var(--text-primary)',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textAlign: 'left',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              window.location.href = '/tokens';
            }}
          >
            Tokens
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            style={{
              color: 'var(--accent-orange)',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textAlign: 'left',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

