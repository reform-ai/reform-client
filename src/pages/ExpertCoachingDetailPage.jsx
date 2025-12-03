import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import { API_ENDPOINTS } from '../config/api';
import { formatDateTime } from '../shared/utils/dateFormat';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import AcknowledgmentComponent from '../shared/components/expert-coaching/AcknowledgmentComponent';
import PARQComponent from '../shared/components/expert-coaching/PARQComponent';

const ExpertCoachingDetailPage = () => {
  const navigate = useNavigate();
  const { consultationId } = useParams();
  const isAuthenticated = useRequireAuth(navigate);

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isAuthenticated && consultationId) {
      fetchConsultation();
    }
  }, [isAuthenticated, consultationId]);

  const fetchConsultation = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_CONSULTATION(consultationId),
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

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this consultation?')) {
      return;
    }

    try {
      setCancelling(true);
      await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_UPDATE(consultationId),
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'cancelled' })
        },
        navigate
      );
      // Refresh consultation data
      await fetchConsultation();
    } catch (err) {
      console.error('Failed to cancel consultation:', err);
      alert(err.message || 'Failed to cancel consultation');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      active: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };


  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Consultation Details" />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading consultation...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !consultation) {
    return (
      <PageContainer>
        <PageHeader title="Consultation Details" />
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
            onClick={() => navigate('/expert-coaching/consultations')}
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
      <PageHeader title="Consultation Details" />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/expert-coaching/consultations')}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    padding: '6px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    backgroundColor: getStatusColor(consultation.status) + '20',
                    color: getStatusColor(consultation.status)
                  }}
                >
                  {consultation.status}
                </span>
              </div>
            </div>
            {consultation.status === 'pending' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: cancelling ? '#ccc' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: cancelling ? 'not-allowed' : 'pointer'
                }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
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

          <div style={{
            padding: '16px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Created:</strong> {formatDateTime(consultation.created_at)}
            </div>
            {consultation.started_at && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Started:</strong> {formatDateTime(consultation.started_at)}
              </div>
            )}
            {consultation.completed_at && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Completed:</strong> {formatDateTime(consultation.completed_at)}
              </div>
            )}
            {consultation.cancelled_at && (
              <div>
                <strong>Cancelled:</strong> {formatDateTime(consultation.cancelled_at)}
              </div>
            )}
          </div>
        </div>

        {/* PAR-Q Section (Optional) - Show for all pending consultations that haven't completed it */}
        {consultation.status === 'pending' && !consultation.request_data?.parq_responses && (
          <PARQComponent
            consultationId={consultationId}
            onComplete={(result, warnings) => {
              if (result) {
                if (warnings && warnings.length > 0) {
                  alert(`PAR-Q submitted. ${warnings.join(' ')}`);
                } else {
                  alert('PAR-Q responses submitted successfully!');
                }
                fetchConsultation(); // Refresh consultation data
              }
            }}
            navigate={navigate}
          />
        )}

        {/* Show completion status */}
        {(consultation.request_data?.acknowledged === true || consultation.request_data?.acknowledged === 'true' || consultation.request_data?.acknowledged_at) && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            marginTop: '20px',
            fontSize: '14px'
          }}>
            ✓ Acknowledgment completed
            {consultation.request_data?.parq_responses && ' • PAR-Q completed'}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ExpertCoachingDetailPage;

