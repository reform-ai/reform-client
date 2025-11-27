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
      if (err.message && err.message.includes('Authentication required')) {
        setXStatus({ connected: false, oauth1_connected: false, x_username: null });
        return;
      }
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
  }, [refreshTrigger]);

  const openOAuthPopup = async () => {
    try {
      const response = await authenticatedFetchJson(
        `${API_ENDPOINTS.X_CONNECT}?return_url=true`,
        {},
        navigate
      );
      
      if (response.connected) {
        await fetchXStatus();
        return null;
      }
      
      const oauthUrl = response.oauth_url;
      const detectedFlowType = response.flow_type;
      
      if (!oauthUrl) {
        setError('Failed to get OAuth URL. Please try again.');
        return null;
      }
      
      const popupWidth = 600;
      const popupHeight = 700;
      const left = (window.screen.width - popupWidth) / 2;
      const top = (window.screen.height - popupHeight) / 2;
      
      const popup = window.open(
        oauthUrl,
        detectedFlowType === 'oauth1' ? 'X OAuth 1.0a' : 'X OAuth',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );
      
      if (!popup) {
        setError('Please allow popups for this site to connect your X account.');
        return null;
      }
      
      return popup;
    } catch (err) {
      setError(err.message || 'Failed to connect X account. Please try again.');
      return null;
    }
  };

  const handleConnect = async () => {
    setError('');
    
    const needsOAuth1 = !isOAuth1Connected;
    
    const popup = await openOAuthPopup();
    if (!popup) {
      return;
    }
    
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      
      if (event.data.type === 'X_OAUTH_SUCCESS') {
        await fetchXStatus();
        
        if (needsOAuth1) {
          try {
            const response = await authenticatedFetchJson(
              `${API_ENDPOINTS.X_CONNECT}?return_url=true`,
              {},
              navigate
            );
            
            if (response.oauth_url && response.flow_type === 'oauth1') {
              popup.location.href = response.oauth_url;
            } else {
              window.removeEventListener('message', handleMessage);
              popup.close();
            }
          } catch (err) {
            window.removeEventListener('message', handleMessage);
            popup.close();
            setError('Failed to continue connection. Please try again.');
          }
        } else {
          window.removeEventListener('message', handleMessage);
          popup.close();
        }
      } else if (event.data.type === 'X_OAUTH1_SUCCESS') {
        window.removeEventListener('message', handleMessage);
        popup.close();
        fetchXStatus();
      } else if (event.data.type === 'X_OAUTH_ERROR' || event.data.type === 'X_OAUTH1_ERROR') {
        window.removeEventListener('message', handleMessage);
        popup.close();
        setError(event.data.message || 'Failed to connect X account. Please try again.');
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
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
      
      {isConnected && isOAuth1Connected ? (
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
                  Connected to X
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
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)' 
          }}>
            You can share your analysis results (including images and videos) to X directly from the platform.
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
              {isConnected 
                ? 'Complete your X connection to enable media uploads (images/videos).'
                : 'Connect your X account to share your analysis results directly to X.'}
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
              {isConnected ? 'Complete Connection' : 'Connect X Account'}
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

