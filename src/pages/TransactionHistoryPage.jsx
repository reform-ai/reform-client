import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import { formatDateTime, formatDateOnly } from '../shared/utils/dateFormat';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import '../shared/styles/AnalysisSkeleton.css';

const TransactionHistoryPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await authenticatedFetchJson(API_ENDPOINTS.TOKEN_TRANSACTIONS, {}, navigate);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError(err.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useRequireAuth(navigate, fetchTransactions);

  const getSourceLabel = (source) => {
    const labels = {
      'monthly_allotment': 'Monthly Allotment',
      'promotional': 'Promotional',
      'signup_bonus': 'Signup Bonus',
      'referral_bonus': 'Referral Bonus',
      'stripe_purchase': 'Purchase',
      'analysis_usage': 'Analysis Usage',
      'subscription_monthly': 'Subscription'
    };
    return labels[source] || source;
  };

  const getTransactionTypeLabel = (tokenType, amount) => {
    if (amount > 0) {
      return tokenType === 'free' ? 'Free Token Credit' : 'Purchased Token Credit';
    } else {
      return 'Token Debit';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div className="skeleton-shell">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--text-primary)' }}>Loading transaction history...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
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
            <h1 className="skeleton-title">Transaction History</h1>
          </div>
        </header>

        <div className="skeleton-grid">
          <article className="skeleton-card">
            <div style={{ padding: '20px' }}>
              {transactions.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-secondary)'
                }}>
                  <p>No transactions found.</p>
                  <button
                    onClick={() => navigate('/tokens')}
                    className="btn btn-primary"
                    style={{ marginTop: '16px' }}
                  >
                    Back to Tokens
                  </button>
                </div>
              ) : (
                <>
                  <div style={{
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <p style={{
                      margin: 0,
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => navigate('/tokens')}
                      className="btn"
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      Back to Tokens
                    </button>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {transactions.map((txn) => (
                      <div
                        key={txn.id}
                        style={{
                          padding: '16px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '16px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                          }}>
                            <div style={{
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              color: txn.amount > 0 ? 'var(--accent-green)' : 'var(--accent-orange)'
                            }}>
                              {txn.amount > 0 ? '+' : ''}{txn.amount}
                            </div>
                            <div style={{
                              padding: '4px 8px',
                              background: txn.token_type === 'free' 
                                ? 'rgba(59, 130, 246, 0.1)' 
                                : 'rgba(249, 115, 22, 0.1)',
                              border: `1px solid ${txn.token_type === 'free' ? 'var(--accent-blue)' : 'var(--accent-orange)'}`,
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: txn.token_type === 'free' ? 'var(--accent-blue)' : 'var(--accent-orange)',
                              textTransform: 'uppercase'
                            }}>
                              {txn.token_type}
                            </div>
                          </div>
                          <p style={{
                            margin: '4px 0',
                            fontSize: '0.9rem',
                            color: 'var(--text-primary)',
                            fontWeight: 500
                          }}>
                            {getTransactionTypeLabel(txn.token_type, txn.amount)}
                          </p>
                          <p style={{
                            margin: '4px 0',
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)'
                          }}>
                            Source: {getSourceLabel(txn.source)}
                          </p>
                          {txn.expires_at && (
                            <p style={{
                              margin: '4px 0',
                              fontSize: '0.8rem',
                              color: 'var(--text-tertiary)',
                              fontStyle: 'italic'
                            }}>
                              Expires: {formatDateOnly(txn.expires_at)}
                            </p>
                          )}
                        </div>
                        <div style={{
                          textAlign: 'right',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)'
                        }}>
                          <div>{formatDateTime(txn.created_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </article>
        </div>
      </div>
    </PageContainer>
  );
};

export default TransactionHistoryPage;

