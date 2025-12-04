import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetchJson } from '../../../shared/utils/authenticatedFetch';
import { API_ENDPOINTS } from '../../../config/api';
import PageContainer from '../../../shared/components/layout/PageContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';

function ExpertCoachingVoucherPage() {
  const [voucherCode, setVoucherCode] = useState('');
  const [error, setError] = useState(null);
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidating(true);

    try {
      const result = await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_VALIDATE_VOUCHER,
        {
          method: 'POST',
          body: JSON.stringify({ voucher_code: voucherCode })
        },
        navigate
      );

      if (result.valid) {
        // Store voucher validation in sessionStorage (or you could use a backend session)
        sessionStorage.setItem('expert_coaching_voucher_validated', 'true');
        navigate('/expert-coaching/request');
      } else {
        setError(result.message || 'Invalid voucher code');
      }
    } catch (err) {
      console.error('Failed to validate voucher:', err);
      setError(err.message || 'Failed to validate voucher code. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Request Consultation" />
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'var(--text-primary)'
          }}>
            Enter Voucher Code
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Please enter your voucher code to proceed with requesting a consultation.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Enter voucher code"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
                  border: `2px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: '600'
                }}
                autoFocus
                disabled={validating}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                marginBottom: '24px',
                color: '#991b1b',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!voucherCode.trim() || validating}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                backgroundColor: voucherCode.trim() && !validating ? '#10b981' : '#6b7280',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: voucherCode.trim() && !validating ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              {validating ? 'Validating...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}

export default ExpertCoachingVoucherPage;

