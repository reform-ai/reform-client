import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequireAuth } from '../../../shared/utils/useRequireAuth';
import { authenticatedFetch } from '../../../shared/utils/authenticatedFetch';
import { API_ENDPOINTS } from '../../../config/api';
import { getStatusColor } from '../utils/expertCoachingConstants';
import ConsultationStatusBadge from '../components/ConsultationStatusBadge';
import ConsultationTimestamps from '../components/ConsultationTimestamps';
import PTBookingInfo from '../components/PTBookingInfo';
import PageContainer from '../../../shared/components/layout/PageContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';

const getAdminSecret = () => {
  return import.meta.env.VITE_ADMIN_SECRET || '';
};

const authenticatedAdminFetch = async (url, options = {}, navigate = null) => {
  const adminSecret = getAdminSecret();
  if (!adminSecret) {
    throw new Error('Admin secret not configured. Set VITE_ADMIN_SECRET in .env.local');
  }

  const headers = {
    ...options.headers,
    'X-Admin-Secret': adminSecret
  };

  const response = await authenticatedFetch(url, { ...options, headers }, navigate);
  return await response.json();
};

const PTExpertCoachingDetailPage = () => {
  const navigate = useNavigate();
  const { consultationId } = useParams();
  const isAuthenticated = useRequireAuth(navigate);

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isAuthenticated && consultationId) {
      fetchConsultation();
    }
  }, [isAuthenticated, consultationId]);

  const fetchConsultation = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authenticatedAdminFetch(
        API_ENDPOINTS.PT_EXPERT_COACHING_CONSULTATION(consultationId),
        { method: 'GET' },
        navigate
      );
      setConsultation(data);
    } catch (err) {
      console.error('Failed to fetch consultation:', err);
      setError(err.message || 'Failed to load consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change this consultation status to "${newStatus}"?`)) {
      return;
    }

    try {
      setUpdating(true);
      await authenticatedAdminFetch(
        API_ENDPOINTS.PT_EXPERT_COACHING_UPDATE_STATUS(consultationId),
        {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus })
        },
        navigate
      );
      
      // Refresh consultation data
      await fetchConsultation();
    } catch (err) {
      console.error('Failed to update consultation status:', err);
      alert(err.message || 'Failed to update consultation status');
    } finally {
      setUpdating(false);
    }
  };


  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Consultation Details (PT)" />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading consultation...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !consultation) {
    return (
      <PageContainer>
        <PageHeader title="Consultation Details (PT)" />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error || 'Consultation not found'}
          </div>
          <button
            onClick={() => navigate('/pt/expert-coaching/consultations')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Back to Consultations
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Consultation Details (PT)" />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/pt/expert-coaching/consultations')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Back to Consultations
          </button>
        </div>

        <div style={{
          padding: '24px',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-primary)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Consultation Details</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <ConsultationStatusBadge status={consultation.status} size="medium" />
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
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {consultation.status === 'pending_booking' && (
                <button
                  onClick={() => handleStatusChange('scheduled')}
                  disabled={updating}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: updating ? '#ccc' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {updating ? 'Confirming...' : 'Confirm Booking'}
                </button>
              )}
              {consultation.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('active')}
                  disabled={updating}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: updating ? '#ccc' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {updating ? 'Updating...' : 'Activate'}
                </button>
              )}
              {consultation.status === 'active' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  disabled={updating}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: updating ? '#ccc' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {updating ? 'Updating...' : 'Mark Complete'}
                </button>
              )}
              {consultation.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updating}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: updating ? '#ccc' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {updating ? 'Updating...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>User ID</h3>
            <p style={{
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              {consultation.user_id}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>Primary Goals</h3>
            <p style={{
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {consultation.request_data?.goals || 'N/A'}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>Questions & Concerns</h3>
            <p style={{
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {consultation.request_data?.questions || 'N/A'}
            </p>
          </div>

          {consultation.request_data?.notes && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>Additional Notes</h3>
              <p style={{
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {consultation.request_data.notes}
              </p>
            </div>
          )}

          {consultation.request_data?.parq_responses && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>PAR-Q Responses</h3>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {JSON.stringify(consultation.request_data.parq_responses, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Booking Information */}
          <PTBookingInfo consultation={consultation} />

          <ConsultationTimestamps consultation={consultation} />
        </div>
      </div>
    </PageContainer>
  );
};

export default PTExpertCoachingDetailPage;

