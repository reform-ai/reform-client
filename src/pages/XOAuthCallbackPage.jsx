import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * X OAuth Callback Page
 * 
 * This page is opened in a popup window during the X OAuth flow.
 * It receives the OAuth callback from X, then communicates with the parent window
 * and closes itself.
 */
function XOAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Check if we're in a popup (opened by window.open)
    if (window.opener) {
      const success = searchParams.get('x_oauth_success') === 'true';
      const error = searchParams.get('x_oauth_error');
      
      if (success) {
        // Send success message to parent window
        window.opener.postMessage(
          { type: 'X_OAUTH_SUCCESS' },
          window.location.origin
        );
      } else if (error) {
        // Send error message to parent window
        const errorMessages = {
          'missing_parameters': 'OAuth callback missing required parameters. Please try again.',
          'invalid_state': 'OAuth session expired. Please try connecting again.',
          'user_not_found': 'User not found. Please log in and try again.',
          'token_exchange_failed': 'Failed to exchange authorization code. Please try again.',
          'no_access_token': 'X did not provide an access token. Please try again.',
          'timeout': 'Request to X timed out. Please try again.',
          'server_error': 'An error occurred during X connection. Please try again.'
        };
        
        window.opener.postMessage(
          { 
            type: 'X_OAUTH_ERROR',
            message: errorMessages[error] || 'Failed to connect X account. Please try again.'
          },
          window.location.origin
        );
      }
      
      // Close the popup after a short delay
      setTimeout(() => {
        window.close();
      }, 500);
    } else {
      // Not in a popup - redirect to profile page
      const success = searchParams.get('x_oauth_success') === 'true';
      const error = searchParams.get('x_oauth_error');
      
      if (success) {
        window.location.href = '/profile?x_oauth_success=true';
      } else if (error) {
        window.location.href = `/profile?x_oauth_error=${error}`;
      } else {
        window.location.href = '/profile';
      }
    }
  }, [searchParams]);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      background: 'var(--bg-primary, #fff)',
      color: 'var(--text-primary, #000)'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '16px' }}>
        {searchParams.get('x_oauth_success') === 'true' ? '✅' : '⏳'}
      </div>
      <p style={{ fontSize: '1rem', margin: 0 }}>
        {searchParams.get('x_oauth_success') === 'true' 
          ? 'X account connected successfully! Closing window...'
          : searchParams.get('x_oauth_error')
          ? 'An error occurred. Closing window...'
          : 'Processing X connection...'}
      </p>
    </div>
  );
}

export default XOAuthCallbackPage;

