import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { authenticatedFetch } from '../shared/utils/authenticatedFetch';
import { API_ENDPOINTS } from '../config/api';
import { formatDateTime, parseUTCDate } from '../shared/utils/dateFormat';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';

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

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      pending_booking: '#3b82f6',
      scheduled: '#10b981',
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
          {(consultation.status === 'pending_booking' || consultation.status === 'scheduled') && (
            <div style={{ 
              marginBottom: '24px',
              padding: '20px',
              backgroundColor: consultation.status === 'pending_booking' ? '#fef3c7' : '#d1fae5',
              border: `2px solid ${consultation.status === 'pending_booking' ? '#f59e0b' : '#10b981'}`,
              borderRadius: '12px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                marginBottom: '16px', 
                fontWeight: '600',
                color: consultation.status === 'pending_booking' ? '#92400e' : '#065f46'
              }}>
                {consultation.status === 'pending_booking' ? '📅 Booking Request Pending' : '✅ Booking Confirmed'}
              </h3>
              
              {consultation.scheduled_start_time && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: consultation.status === 'pending_booking' ? '#92400e' : '#065f46' }}>
                    Scheduled Start:
                  </strong>
                  <p style={{ 
                    margin: '4px 0 0 0',
                    color: consultation.status === 'pending_booking' ? '#78350f' : '#047857'
                  }}>
                    {parseUTCDate(consultation.scheduled_start_time)?.toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZoneName: 'short',
                      timeZone: 'America/New_York'
                    })}
                  </p>
                </div>
              )}
              
              {consultation.scheduled_end_time && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: consultation.status === 'pending_booking' ? '#92400e' : '#065f46' }}>
                    Scheduled End:
                  </strong>
                  <p style={{ 
                    margin: '4px 0 0 0',
                    color: consultation.status === 'pending_booking' ? '#78350f' : '#047857'
                  }}>
                    {parseUTCDate(consultation.scheduled_end_time)?.toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZoneName: 'short',
                      timeZone: 'America/New_York'
                    })}
                  </p>
                </div>
              )}
              
              {consultation.booking_requested_at && (
                <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                  <strong style={{ color: consultation.status === 'pending_booking' ? '#92400e' : '#065f46' }}>
                    Requested:
                  </strong>
                  <span style={{ 
                    marginLeft: '8px',
                    color: consultation.status === 'pending_booking' ? '#78350f' : '#047857'
                  }}>
                    {formatDateTime(consultation.booking_requested_at)}
                  </span>
                </div>
              )}
              
              {consultation.meeting_link && (
                <div style={{ 
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: consultation.status === 'pending_booking' ? '#fef3c7' : '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #10b981'
                }}>
                  <strong style={{ color: '#065f46', display: 'block', marginBottom: '8px' }}>
                    Google Meet Link:
                  </strong>
                  <a
                    href={consultation.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#10b981',
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {consultation.meeting_link}
                  </a>
                </div>
              )}
              
              {consultation.booking_confirmed_at && (
                <div style={{ marginTop: '12px', fontSize: '14px' }}>
                  <strong style={{ color: '#065f46' }}>Confirmed:</strong>
                  <span style={{ marginLeft: '8px', color: '#047857' }}>
                    {formatDateTime(consultation.booking_confirmed_at)}
                  </span>
                </div>
              )}
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
      </div>
    </PageContainer>
  );
};

export default PTExpertCoachingDetailPage;

