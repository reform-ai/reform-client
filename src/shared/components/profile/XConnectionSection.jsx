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
      // If 404 or not connected, that's okay - just means no connection
      if (err.message && !err.message.includes('not found')) {
        setError(err.message || 'Failed to check X connection status');
      }
      setXStatus({ connected: false, x_username: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleConnect = () => {
    // Redirect to OAuth login endpoint
    // The backend will handle the OAuth flow and redirect back
    window.location.href = API_ENDPOINTS.X_LOGIN;
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
                  Connected
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

