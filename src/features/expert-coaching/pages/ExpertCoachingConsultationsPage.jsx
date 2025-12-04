import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRequireAuth } from '../../../shared/utils/useRequireAuth';
import { authenticatedFetchJson } from '../../../shared/utils/authenticatedFetch';
import { API_ENDPOINTS } from '../../../config/api';
import { getStatusColor } from '../utils/expertCoachingConstants';
import { formatConsultationTimestamp } from '../utils/expertCoachingDateFormat';
import ConsultationStatusBadge from '../components/ConsultationStatusBadge';
import PageContainer from '../../../shared/components/layout/PageContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';

const ExpertCoachingConsultationsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useRequireAuth(navigate);

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConsultations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Check if we just created a consultation
    const createdId = searchParams.get('created');
    if (createdId) {
      // Show success message or highlight the new consultation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [searchParams]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_CONSULTATIONS,
        { method: 'GET' },
        navigate
      );
      setConsultations(data.consultations || []);
    } catch (err) {
      console.error('Failed to fetch consultations:', err);
      setError(err.message || 'Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };



  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader title="My Consultations" />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        {searchParams.get('created') && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            Consultation request created successfully!
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', margin: 0 }}>Your Consultations</h2>
          <button
            onClick={() => navigate('/expert-coaching/request')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            + New Request
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading consultations...</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && consultations.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>No consultations yet</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Start by requesting your first consultation
            </p>
            <button
              onClick={() => navigate('/expert-coaching/request')}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Request Consultation
            </button>
          </div>
        )}

        {!loading && !error && consultations.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                onClick={() => navigate(`/expert-coaching/consultations/${consultation.id}`)}
                style={{
                  padding: '20px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: 'var(--bg-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <ConsultationStatusBadge status={consultation.status} size="small" />
                      {(consultation.request_data?.acknowledged === true || consultation.request_data?.acknowledged === 'true' || consultation.request_data?.acknowledged_at) && (
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backgroundColor: '#d1fae5',
                            color: '#065f46'
                          }}
                        >
                          ✓ Acknowledged
                        </span>
                      )}
                      {consultation.request_data?.parq_responses && (
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af'
                          }}
                        >
                          ✓ PAR-Q Complete
                        </span>
                      )}
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {formatConsultationTimestamp(consultation.created_at)}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--text-primary)'
                    }}>
                      Goals: {consultation.request_data?.goals || 'N/A'}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      Questions: {consultation.request_data?.questions || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ExpertCoachingConsultationsPage;

