import React, { useState } from 'react';
import { authenticatedFetchJson } from '../../utils/authenticatedFetch';
import { API_ENDPOINTS } from '../../../config/api';

const AcknowledgmentComponent = ({ consultationId, onComplete, navigate }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acknowledged) {
      setError('Please acknowledge to continue');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const result = await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_ACKNOWLEDGE(consultationId),
        {
          method: 'POST',
          body: JSON.stringify({ acknowledged: true })
        },
        navigate
      );

      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      console.error('Failed to submit acknowledgment:', err);
      setError(err.message || 'Failed to submit acknowledgment');
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      padding: '24px',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-primary)',
      marginBottom: '24px'
    }}>
      <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
        Acknowledgment Required
      </h3>
      
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        marginBottom: '16px',
        lineHeight: '1.6'
      }}>
        <p style={{ marginBottom: '12px' }}>
          I understand that this is AI-generated guidance, not medical advice. I will consult a qualified healthcare provider if needed.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label style={{
          display: 'flex',
          alignItems: 'start',
          gap: '12px',
          marginBottom: '16px',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            style={{
              marginTop: '4px',
              width: '18px',
              height: '18px',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
            I acknowledge and agree to the above statement
          </span>
        </label>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!acknowledged || submitting}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: (!acknowledged || submitting) ? '#ccc' : 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (!acknowledged || submitting) ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Acknowledgment'}
        </button>
      </form>
    </div>
  );
};

export default AcknowledgmentComponent;

