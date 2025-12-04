import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRequireAuth } from '../../../shared/utils/useRequireAuth';
import { authenticatedFetch } from '../../../shared/utils/authenticatedFetch';
import { API_ENDPOINTS } from '../../../config/api';
import { getStatusColor } from '../utils/expertCoachingConstants';
import { formatConsultationTimestamp } from '../utils/expertCoachingDateFormat';
import ConsultationStatusBadge from '../components/ConsultationStatusBadge';
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

const PTExpertCoachingConsultationsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useRequireAuth(navigate);

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchConsultations();
    }
  }, [isAuthenticated, statusFilter]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build URL with status filter
      let url = API_ENDPOINTS.PT_EXPERT_COACHING_CONSULTATIONS;
      if (statusFilter && statusFilter !== 'all') {
        url += `?status_filter=${statusFilter}`;
      }
      
      const data = await authenticatedAdminFetch(
        url,
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

  const handleStatusChange = async (consultationId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this consultation status to "${newStatus}"?`)) {
      return;
    }

    try {
      await authenticatedAdminFetch(
        API_ENDPOINTS.PT_EXPERT_COACHING_UPDATE_STATUS(consultationId),
        {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus })
        },
        navigate
      );
      
      // Refresh consultations
      await fetchConsultations();
    } catch (err) {
      console.error('Failed to update consultation status:', err);
      alert(err.message || 'Failed to update consultation status');
    }
  };


  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader title="Expert Coaching Consultations (PT)" />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '24px', margin: 0 }}>All Consultations</h2>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value === 'all') {
                  newParams.delete('status');
                } else {
                  newParams.set('status', e.target.value);
                }
                setSearchParams(newParams);
              }}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading consultations...</p>
          </div>
        )}

        {!loading && !error && consultations.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>No consultations found</p>
            <p style={{ color: 'var(--text-secondary)' }}>
              {statusFilter !== 'all' ? `No consultations with status "${statusFilter}"` : 'No consultations yet'}
            </p>
          </div>
        )}

        {!loading && !error && consultations.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                style={{
                  padding: '20px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
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
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      User ID: {consultation.user_id}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => navigate(`/pt/expert-coaching/consultations/${consultation.id}`)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      View Details
                    </button>
                    {consultation.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(consultation.id, 'active')}
                        style={{
                          padding: '8px 16px',
                          fontSize: '14px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Activate
                      </button>
                    )}
                    {consultation.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(consultation.id, 'completed')}
                        style={{
                          padding: '8px 16px',
                          fontSize: '14px',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Complete
                      </button>
                    )}
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

export default PTExpertCoachingConsultationsPage;

