import React from 'react';
import '../../styles/upload/AnonymousLimitMessage.css';

/**
 * AnonymousLimitMessage - Displays message when anonymous user has reached limit
 * 
 * Props:
 * - onSignInClick: () => void - Callback when sign in button is clicked
 */
const AnonymousLimitMessage = ({ onSignInClick }) => {
  return (
    <div className="limit-message">
      You've reached the limit for anonymous analysis. <button 
        onClick={() => onSignInClick?.()}
        className="signin-link"
      >
        Sign in
      </button> to continue.
    </div>
  );
};

export default AnonymousLimitMessage;

