import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const isAuthenticated = useRequireAuth(navigate);

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCreatedPrompt, setShowCreatedPrompt] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isAuthenticated && consultationId) {
      fetchConsultation();
      // Check if we just created this consultation
      if (searchParams.get('created') === 'true') {
        setShowCreatedPrompt(true);
      }
    }
  }, [isAuthenticated, consultationId, searchParams]);

  // Set default expand state based on status
  useEffect(() => {
    if (consultation) {
      // Show details by default only for pending or cancelled status
      setShowDetails(consultation.status === 'pending' || consultation.status === 'cancelled');
    }
  }, [consultation]);

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

          {/* Expandable Details Section */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <span>Consultation Details</span>
              <span style={{
                fontSize: '20px',
                transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▼
              </span>
            </button>
            
            {showDetails && (
              <div style={{
                padding: '20px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                marginTop: '-8px'
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>Primary Goals</h3>
                  <p style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-primary)',
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
                    backgroundColor: 'var(--bg-primary)',
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
                      backgroundColor: 'var(--bg-primary)',
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
                  backgroundColor: 'var(--bg-primary)',
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
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        {consultation.status === 'pending' && (
          <div style={{
            padding: '24px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '20px',
              color: 'var(--text-primary)'
            }}>
              Request Progress
            </h3>
            
            {/* Progress Steps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Step 1: Request Created */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  ✓
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '2px'
                  }}>
                    Step 1: Request Created
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    Completed
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              <div style={{
                flex: '1 1 40px',
                height: '2px',
                backgroundColor: consultation.request_data?.parq_responses ? '#10b981' : 'var(--border-color)',
                minWidth: '20px'
              }} />
              
              {/* Step 2: Complete PAR-Q */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: consultation.request_data?.parq_responses ? '#10b981' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {consultation.request_data?.parq_responses ? '✓' : '2'}
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '2px'
                  }}>
                    Step 2: Complete PAR-Q
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: consultation.request_data?.parq_responses ? 'var(--text-secondary)' : '#f59e0b'
                  }}>
                    {consultation.request_data?.parq_responses ? 'Completed' : 'In Progress'}
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              {consultation.request_data?.parq_responses && (
                <>
                  <div style={{
                    flex: '1 1 40px',
                    height: '2px',
                    backgroundColor: consultation.status === 'pending_booking' || consultation.status === 'scheduled' ? '#10b981' : 'var(--border-color)',
                    minWidth: '20px'
                  }} />
                  
                  {/* Step 3: Book Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: consultation.status === 'pending_booking' || consultation.status === 'scheduled' ? '#10b981' : 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: consultation.status === 'pending_booking' || consultation.status === 'scheduled' ? 'white' : 'var(--text-secondary)',
                      fontSize: '16px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {consultation.status === 'pending_booking' || consultation.status === 'scheduled' ? '✓' : '3'}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '2px'
                      }}>
                        Step 3: Book Time
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: consultation.status === 'pending_booking' || consultation.status === 'scheduled' ? 'var(--text-secondary)' : 'var(--text-muted)'
                      }}>
                        {consultation.status === 'pending_booking' ? 'Awaiting Confirmation' : 
                         consultation.status === 'scheduled' ? 'Confirmed' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Prompt to complete request when just created */}
        {showCreatedPrompt && consultation.status === 'pending' && !consultation.request_data?.parq_responses && (
          <div style={{
            padding: '24px',
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '16px',
            marginBottom: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCreatedPrompt(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                color: '#f59e0b',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '4px 8px'
              }}
            >
              ×
            </button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                📋
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#92400e',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  Complete Your Request
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#78350f',
                  margin: 0
                }}>
                  Please complete the PAR-Q questionnaire below to finish your consultation request and proceed to booking.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PAR-Q Section (Optional) - Show for all pending consultations that haven't completed it */}
        {consultation.status === 'pending' && !consultation.request_data?.parq_responses && (
          <PARQComponent
            consultationId={consultationId}
            onComplete={(result, warnings) => {
              if (result) {
                setShowCreatedPrompt(false); // Hide prompt after completion
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

        {/* Success Confirmation Banner - Show after submission */}
        {searchParams.get('completed') === 'true' && (
          <div style={{
            padding: '24px',
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '16px',
            marginBottom: '24px',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                ✓
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#065f46',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  Request Submitted Successfully!
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#047857',
                  margin: 0
                }}>
                  Your consultation request has been submitted. Our PT team will review and confirm your appointment soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Consultation Details - Show when PT confirms */}
        {consultation.status === 'scheduled' && consultation.scheduled_start_time && (
          <div style={{
            padding: '24px',
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                ✓
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#065f46',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  Consultation Confirmed!
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#047857',
                  margin: 0
                }}>
                  Your consultation has been confirmed by the PT team.
                </p>
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #86efac'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#065f46',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Scheduled Time
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {formatDateTime(consultation.scheduled_start_time)}
                </div>
                {consultation.scheduled_end_time && (
                  <div style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Until {new Date(consultation.scheduled_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              {consultation.meeting_link && (
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#065f46',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Google Meet Link
                  </div>
                  <a
                    href={consultation.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#10b981';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span>🎥</span>
                    Join Google Meet
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ExpertCoachingDetailPage;

