import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';

/**
 * X OAuth Callback Page
 * 
 * This page is opened in a popup window during the X OAuth flow.
 * It receives the OAuth callback from X, then communicates with the parent window
 * and either redirects to OAuth 1.0a (if needed) or closes itself.
 */
function XOAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    // Check if we're in a popup (opened by window.open)
    if (window.opener) {
      // Check for OAuth 2.0 callback
      const success = searchParams.get('x_oauth_success') === 'true';
      const error = searchParams.get('x_oauth_error');
      
      // Check for OAuth 1.0a callback
      const oauth1Success = searchParams.get('x_oauth1_success') === 'true';
      const oauth1Error = searchParams.get('x_oauth1_error');
      
      if (success) {
        // Send success message to parent window (OAuth 2.0)
        window.opener.postMessage(
          { type: 'X_OAUTH_SUCCESS' },
          window.location.origin
        );
        
        // Check if OAuth 1.0a is needed and redirect if so
        const checkAndRedirect = async () => {
          try {
            const response = await authenticatedFetchJson(
              `${API_ENDPOINTS.X_CONNECT}?return_url=true`,
              {},
              null // No navigate needed in popup
            );
            
            if (response.oauth_url && response.flow_type === 'oauth1') {
              // Set redirecting state before redirecting
              setIsRedirecting(true);
              // Redirect to OAuth 1.0a instead of closing
              window.location.href = response.oauth_url;
              return;
            }
          } catch (err) {
            console.error('Failed to check OAuth 1.0a status:', err);
          }
          
          // Close the popup if OAuth 1.0a is not needed or check failed
          setTimeout(() => {
            window.close();
          }, 500);
        };
        
        checkAndRedirect();
      } else if (oauth1Success) {
        // Send success message to parent window (OAuth 1.0a)
        window.opener.postMessage(
          { type: 'X_OAUTH1_SUCCESS' },
          window.location.origin
        );
        
        // Close the popup after a short delay
        setTimeout(() => {
          window.close();
        }, 500);
      } else if (error) {
        // Send error message to parent window (OAuth 2.0)
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
        
        // Close the popup after a short delay
        setTimeout(() => {
          window.close();
        }, 500);
      } else if (oauth1Error) {
        // Send error message to parent window (OAuth 1.0a)
        const errorMessages = {
          'user_denied': 'You denied access to your X account. Please try again if you want to connect.',
          'missing_parameters': 'OAuth callback missing required parameters. Please try again.',
          'invalid_token': 'OAuth session expired. Please try connecting again.',
          'token_expired': 'OAuth session expired. Please try connecting again.',
          'user_not_found': 'User not found. Please log in and try again.',
          'token_exchange_failed': 'Failed to exchange authorization code. Please try again.',
          'server_error': 'An error occurred during X connection. Please try again.'
        };
        
        window.opener.postMessage(
          { 
            type: 'X_OAUTH1_ERROR',
            message: errorMessages[oauth1Error] || 'Failed to connect X account for media posting. Please try again.'
          },
          window.location.origin
        );
        
        // Close the popup after a short delay
        setTimeout(() => {
          window.close();
        }, 500);
      }
    } else {
      // Not in a popup - redirect to profile page
      const success = searchParams.get('x_oauth_success') === 'true' || searchParams.get('x_oauth1_success') === 'true';
      const error = searchParams.get('x_oauth_error') || searchParams.get('x_oauth1_error');
      
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
        {(searchParams.get('x_oauth_success') === 'true' || searchParams.get('x_oauth1_success') === 'true') ? '✅' : '⏳'}
      </div>
      <p style={{ fontSize: '1rem', margin: 0 }}>
        {isRedirecting
          ? 'X account connected successfully! Redirecting...'
          : (searchParams.get('x_oauth_success') === 'true' || searchParams.get('x_oauth1_success') === 'true')
          ? 'X account connected successfully! Closing window...'
          : (searchParams.get('x_oauth_error') || searchParams.get('x_oauth1_error'))
          ? 'An error occurred. Closing window...'
          : 'Processing X connection...'}
      </p>
    </div>
  );
}

export default XOAuthCallbackPage;

