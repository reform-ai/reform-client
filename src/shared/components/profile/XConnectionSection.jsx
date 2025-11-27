import React, { useState, useEffect } from 'react';
import { authenticatedFetchJson } from '../../utils/authenticatedFetch';
import { API_ENDPOINTS } from '../../../config/api';

function XConnectionSection({ navigate, refreshTrigger }) {
  const [xStatus, setXStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchXStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authenticatedFetchJson(API_ENDPOINTS.X_STATUS, {}, navigate);
      setXStatus(data);
    } catch (err) {
      // If authentication error, user might not be logged in - don't show error
      if (err.message && err.message.includes('Authentication required')) {
        // User not authenticated with app - this is handled by app-level auth
        setXStatus({ connected: false, oauth1_connected: false, x_username: null });
        return;
      }
      // If 404 or not connected, that's okay - just means no connection
      if (err.message && !err.message.includes('not found')) {
        setError(err.message || 'Failed to check X connection status');
      }
      setXStatus({ connected: false, oauth1_connected: false, x_username: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleConnect = async () => {
    setError('');
    
    try {
      // Get OAuth URL from backend (authenticated request)
      const response = await authenticatedFetchJson(
        `${API_ENDPOINTS.X_LOGIN}?return_url=true`,
        {},
        navigate
      );
      
      const oauthUrl = response.oauth_url;
      
      if (!oauthUrl) {
        setError('Failed to get OAuth URL. Please try again.');
        return;
      }
      
      // Open popup window for OAuth flow
      const popupWidth = 600;
      const popupHeight = 700;
      const left = (window.screen.width - popupWidth) / 2;
      const top = (window.screen.height - popupHeight) / 2;
      
      const popup = window.open(
        oauthUrl,
        'X OAuth',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );
      
      if (!popup) {
        setError('Please allow popups for this site to connect your X account.');
        return;
      }
      
      // Listen for OAuth completion message from popup
      const handleMessage = (event) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) {
          return;
        }
        
        if (event.data.type === 'X_OAUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          popup.close();
          // Refresh connection status
          fetchXStatus();
        } else if (event.data.type === 'X_OAUTH_ERROR') {
          window.removeEventListener('message', handleMessage);
          popup.close();
          setError(event.data.message || 'Failed to connect X account. Please try again.');
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Failed to connect X account. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your X account? You will need to reconnect to share posts to X.')) {
      return;
    }

    setIsDisconnecting(true);
    setError('');
    
    try {
      await authenticatedFetchJson(API_ENDPOINTS.X_DISCONNECT, {
        method: 'POST'
      }, navigate);
      
      // Refresh status after disconnect
      await fetchXStatus();
    } catch (err) {
      setError(err.message || 'Failed to disconnect X account');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading X connection status...</p>
      </div>
    );
  }

  const isConnected = xStatus?.connected === true;
  const isOAuth1Connected = xStatus?.oauth1_connected === true;
  const xUsername = xStatus?.x_username;

  const handleConnectOAuth1 = async () => {
    setError('');
    
    try {
      // Get OAuth 1.0a URL from backend (authenticated request)
      const response = await authenticatedFetchJson(
        `${API_ENDPOINTS.X_OAUTH1_LOGIN}?return_url=true`,
        {},
        navigate
      );
      
      const oauthUrl = response.oauth_url;
      
      if (!oauthUrl) {
        setError('Failed to get OAuth URL. Please try again.');
        return;
      }
      
      // Open popup window for OAuth flow
      const popupWidth = 600;
      const popupHeight = 700;
      const left = (window.screen.width - popupWidth) / 2;
      const top = (window.screen.height - popupHeight) / 2;
      
      const popup = window.open(
        oauthUrl,
        'X OAuth 1.0a',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );
      
      if (!popup) {
        setError('Please allow popups for this site to connect your X account.');
        return;
      }
      
      // Listen for OAuth completion message from popup
      const handleMessage = (event) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) {
          return;
        }
        
        if (event.data.type === 'X_OAUTH1_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          popup.close();
          // Refresh connection status
          fetchXStatus();
        } else if (event.data.type === 'X_OAUTH1_ERROR') {
          window.removeEventListener('message', handleMessage);
          popup.close();
          setError(event.data.message || 'Failed to connect X account for media posting. Please try again.');
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Failed to connect X account for media posting. Please try again.');
    }
  };

  return (
    <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{
          display: 'block',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          margin: 0
        }}>
          X (Twitter) Connection
        </label>
      </div>
      
      {isConnected ? (
        <div>
          <div style={{
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--accent-green)',
            borderRadius: '8px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-green)', fontSize: '1.2rem' }}>✓</span>
              <div>
                <div style={{ color: 'var(--accent-green)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Connected (OAuth 2.0)
                </div>
                {xUsername && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                    {xUsername}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              style={{
                padding: '6px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                cursor: isDisconnecting ? 'not-allowed' : 'pointer',
                opacity: isDisconnecting ? 0.7 : 1
              }}
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
          
          {/* OAuth 1.0a connection status for media uploads */}
          {isOAuth1Connected ? (
            <div style={{
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--accent-green)',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-green)', fontSize: '1.2rem' }}>✓</span>
                <div style={{ color: 'var(--accent-green)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Media Upload Enabled (OAuth 1.0a)
                </div>
              </div>
              <p style={{ 
                margin: '8px 0 0 0', 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)' 
              }}>
                You can share images and videos to X.
              </p>
            </div>
          ) : (
            <div style={{
              padding: '12px',
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid var(--accent-orange)',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <p style={{ 
                margin: '0 0 12px 0', 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)' 
              }}>
                Connect OAuth 1.0a to enable media uploads (images/videos) to X.
              </p>
              <button
                onClick={handleConnectOAuth1}
                style={{
                  padding: '8px 16px',
                  background: 'var(--accent-orange)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
              >
                <span>📸</span>
                Connect for Media Upload
              </button>
            </div>
          )}
          
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)' 
          }}>
            You can share your analysis results to X directly from the platform.
          </p>
        </div>
      ) : (
        <div>
          <div style={{
            padding: '12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)' 
            }}>
              Connect your X account to share your analysis results directly to X.
            </p>
            <button
              onClick={handleConnect}
              style={{
                padding: '8px 16px',
                background: 'var(--accent-blue)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
            >
              <span>🐦</span>
              Connect X Account
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <p style={{ color: 'var(--accent-orange)', margin: '8px 0 0 0', fontSize: '0.85rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default XConnectionSection;

