import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { getUserToken, isUserLoggedIn } from '../shared/utils/authStorage';
import { formatDateOnly } from '../shared/utils/dateFormat';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import '../shared/styles/AnalysisSkeleton.css';

const TokensPage = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to home if not logged in
    if (!isUserLoggedIn()) {
      navigate('/?login=1');
      return;
    }

    const fetchTokenBalance = async () => {
      const token = getUserToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.TOKEN_BALANCE, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to fetch token balance');
        }

        const data = await response.json();
        setBalance(data);
        
        // If not activated, set error to show activation message
        if (data.is_activated === false) {
          setError('not_activated');
        }
      } catch (err) {
        console.error('Error fetching token balance:', err);
        setError(err.message || 'Failed to load token balance');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenBalance();
  }, [navigate]);

  const TokenCard = ({ title, count, description, color = 'var(--accent-green)', expiresAt = null, children = null }) => (
    <div style={{
      padding: '24px',
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)'
        }}>
          {title}
        </h3>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: color
        }}>
          {count}
        </div>
      </div>
      {description && (
        <p style={{
          margin: 0,
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          {description}
        </p>
      )}
      {expiresAt && (
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          fontStyle: 'italic'
        }}>
          Expires: {formatDateOnly(expiresAt)}
        </p>
      )}
      {children && (
        <div style={{ marginTop: '8px' }}>
          {children}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div className="skeleton-shell">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--text-primary)' }}>Loading token balance...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    // Special handling for not-activated state
    if (error === 'not_activated') {
      return (
        <PageContainer>
          <PageHeader onLoginClick={() => navigate('/?login=1')} />
          <div className="skeleton-shell">
            <div className="skeleton-card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '32px' }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Token System Not Activated</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                You need to activate your token system to start using tokens. Click the button below to go to your profile and activate it.
              </p>
              <button onClick={() => navigate('/profile')} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                Go to Profile to Activate
              </button>
            </div>
          </div>
        </PageContainer>
      );
    }
    
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div className="skeleton-shell">
          <div className="skeleton-card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-orange)', marginBottom: '16px' }}>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">Account</p>
            <h1 className="skeleton-title">Tokens</h1>
          </div>
        </header>

        <div className="skeleton-grid">
          <article className="skeleton-card">
            <div style={{ padding: '20px' }}>
              <div style={{
                marginBottom: '24px',
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    Total Tokens
                  </h2>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: 'var(--accent-green)'
                  }}>
                    {balance?.total || 0}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/tokens/history')}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.9rem'
                  }}
                >
                  Transaction History
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginTop: '24px'
              }}>
                <TokenCard
                  title="Monthly Allotment"
                  count={balance?.breakdown?.monthly_allotment || 0}
                  description="Free monthly tokens (resets in 30 days)"
                  color="var(--accent-green)"
                  expiresAt={balance?.expiration_dates?.monthly_allotment}
                />
                <TokenCard
                  title="Other Free Tokens"
                  count={balance?.breakdown?.other_free || 0}
                  description="Promotional and other free tokens"
                  color="var(--accent-blue)"
                  expiresAt={balance?.expiration_dates?.other_free}
                />
                <TokenCard
                  title="Purchased Tokens"
                  count={balance?.breakdown?.purchased || 0}
                  description="Tokens purchased through payment"
                  color="var(--accent-orange)"
                  expiresAt={balance?.expiration_dates?.purchased}
                >
                  <button
                    onClick={() => {
                      // Placeholder for future buy tokens functionality
                      console.log('Buy tokens clicked');
                    }}
                    className="btn"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      fontSize: '0.9rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                    disabled
                  >
                    Buy tokens - coming soon
                  </button>
                </TokenCard>
              </div>

              <div style={{
                marginTop: '32px',
                padding: '16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--accent-green)',
                borderRadius: '8px'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  lineHeight: '1.6'
                }}>
                  <strong>Token Usage Order:</strong> Monthly Allotment → Promotional → Other Free → Purchased. Purchased tokens never expire.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </PageContainer>
  );
};

export default TokensPage;

