import React, { useState } from 'react';
import { activateTokens } from '../../utils/tokenActivation';
import '../../styles/upload/UploadError.css';

/**
 * UploadError - Displays error messages with optional activation button
 * 
 * This component handles two types of insufficient token errors:
 * 1. User hasn't activated tokens yet -> Shows activation button
 * 2. User has activated but doesn't have enough tokens -> Shows error message only
 * 
 * Props:
 * - errorMessage: string - Error message to display
 * - errorData: object - Additional error data from backend
 *   - needs_activation: boolean - If true, shows activation button
 *   - tokens_remaining: number - Current token balance
 * - onActivationComplete: function - Callback when activation completes (clears error, refreshes tokens)
 */
const UploadError = ({ errorMessage, errorData, onActivationComplete }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState('');

  if (!errorMessage) return null;

  /**
   * Handles token activation when user clicks "Get 10 Free Tokens" button
   * Uses the shared token activation utility for consistency
   */
  const handleActivateTokens = async () => {
    setActivationError('');
    setIsActivating(true);

    try {
      await activateTokens();

      // Activation successful - notify parent component
      // Parent will clear error and refresh token count
      if (onActivationComplete) {
        onActivationComplete();
      }
    } catch (err) {
      setActivationError(err.message || 'Failed to activate tokens');
    } finally {
      setIsActivating(false);
    }
  };

  // Check if this error requires token activation
  // Backend sets needs_activation=true when user hasn't activated their token system
  const needsActivation = errorData?.needs_activation === true;

  return (
    <div className="error">
      <div style={{ marginBottom: needsActivation ? '12px' : 0 }}>
        {errorMessage}
      </div>
      
      {needsActivation && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid var(--accent-green)',
          borderRadius: '8px'
        }}>
          <button
            onClick={handleActivateTokens}
            disabled={isActivating}
            className="btn btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: '0.95rem',
              fontWeight: 600,
              opacity: isActivating ? 0.7 : 1,
              cursor: isActivating ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {isActivating ? 'Activating...' : 'Get 10 Free Tokens'}
          </button>
          {activationError && (
            <p style={{
              color: 'var(--accent-orange)',
              margin: '8px 0 0 0',
              fontSize: '0.85rem'
            }}>
              {activationError}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadError;

