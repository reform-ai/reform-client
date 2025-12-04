import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequireAuth } from '../../../shared/utils/useRequireAuth';
import { authenticatedFetchJson } from '../../../shared/utils/authenticatedFetch';
import { API_ENDPOINTS } from '../../../config/api';
import { formatDateTime } from '../../../shared/utils/dateFormat';
import PageContainer from '../../../shared/components/layout/PageContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';

// Calendar Component
const CalendarView = ({ currentMonth, setCurrentMonth, selectedDate, onDateClick }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Create array of days
  const days = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };
  
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  const isPastDate = (date) => {
    if (!date) return false;
    const dateToCompare = new Date(date);
    dateToCompare.setHours(0, 0, 0, 0);
    return dateToCompare < today;
  };
  
  return (
    <div>
      {/* Month Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px' 
      }}>
        <button
          onClick={goToPreviousMonth}
          style={{
            width: '40px',
            height: '40px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#374151',
            fontSize: '18px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.color = '#10b981';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.color = '#374151';
          }}
        >
          ←
        </button>
        <h3 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          margin: 0,
          color: '#111827'
        }}>
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          style={{
            width: '40px',
            height: '40px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#374151',
            fontSize: '18px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.color = '#10b981';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.color = '#374151';
          }}
        >
          →
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '12px'
      }}>
        {/* Day Headers */}
        {dayNames.map((day, idx) => (
          <div
            key={idx}
            style={{
              padding: '16px 8px',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '14px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />;
          }
          
          const isSelected = isSameDay(date, selectedDate);
          const isPast = isPastDate(date);
          const isToday = isSameDay(date, today);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => !isPast && onDateClick(date)}
              disabled={isPast}
              style={{
                aspectRatio: '1',
                padding: '0',
                border: isSelected 
                  ? '2px solid #10b981' 
                  : isToday 
                    ? '2px solid #10b981' 
                    : '1px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: isSelected 
                  ? '#10b981' 
                  : isToday 
                    ? '#f0fdf4' 
                    : isPast 
                      ? '#f9fafb' 
                      : '#ffffff',
                color: isSelected 
                  ? '#ffffff' 
                  : isPast 
                    ? '#d1d5db' 
                    : '#111827',
                cursor: isPast ? 'not-allowed' : 'pointer',
                fontWeight: isSelected || isToday ? '600' : '400',
                fontSize: '16px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: '60px'
              }}
              onMouseEnter={(e) => {
                if (!isPast && !isSelected) {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isPast && !isSelected) {
                  e.currentTarget.style.borderColor = isToday ? '#10b981' : '#e5e7eb';
                  e.currentTarget.style.backgroundColor = isToday ? '#f0fdf4' : '#ffffff';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {date.getDate()}
              {isToday && !isSelected && (
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ExpertCoachingBookingPage = () => {
  const navigate = useNavigate();
  const { consultationId } = useParams();
  const isAuthenticated = useRequireAuth(navigate);

  const [consultation, setConsultation] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

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

  const fetchAvailableSlots = async (date) => {
    if (!date) return;
    
    try {
      setLoadingSlots(true);
      setError(null);
      setSelectedSlot(null);
      
      // Get start and end of selected day in UTC
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const startDate = startOfDay.toISOString();
      const endDate = endOfDay.toISOString();
      
      const url = `${API_ENDPOINTS.EXPERT_COACHING_CONSULTATION(consultationId)}/availability?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&duration_minutes=30&timezone=UTC`;
      
      const data = await authenticatedFetchJson(
        url,
        { method: 'GET' },
        navigate
      );
      
      setAvailableSlots(data.available_slots || []);
    } catch (err) {
      console.error('Failed to fetch available slots:', err);
      setError(err.message || 'Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateClick = (date) => {
    // Reset to start of day for comparison
    const dateToCompare = new Date(date);
    dateToCompare.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Don't allow selecting past dates
    if (dateToCompare < today) {
      return;
    }
    
    setSelectedDate(date);
    fetchAvailableSlots(date);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await authenticatedFetchJson(
        `${API_ENDPOINTS.EXPERT_COACHING_CONSULTATION(consultationId)}/book`,
        {
          method: 'POST',
          body: JSON.stringify({
            start_time: selectedSlot.start,
            end_time: selectedSlot.end,
            timezone: 'UTC'
          })
        },
        navigate
      );

      // Success - show friendly popup message
      setShowBookingSuccess(true);
      setSubmitting(false);
      // Clear selected slot
      setSelectedSlot(null);
      setSelectedDate(null);
    } catch (err) {
      console.error('Failed to book slot:', err);
      setError(err.message || 'Failed to book time slot');
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Book Consultation" />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading consultation...</p>
        </div>
      </PageContainer>
    );
  }

  if (error && !consultation) {
    return (
      <PageContainer>
        <PageHeader title="Book Consultation" />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
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

  // Check if PAR-Q is completed
  if (!consultation?.request_data?.parq_responses) {
    return (
      <PageContainer>
        <PageHeader title="Book Consultation" />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <div style={{
            padding: '20px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>PAR-Q Required</h3>
            <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
              Please complete the PAR-Q questionnaire before booking your consultation.
            </p>
            <button
              onClick={() => navigate(`/expert-coaching/consultations/${consultationId}`)}
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
              Go to Consultation Details
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 20px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={() => navigate(`/expert-coaching/consultations/${consultationId}`)}
            style={{
              padding: '8px 0',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            marginBottom: '8px',
            color: 'var(--text-primary)',
            lineHeight: '1.2'
          }}>
            Book Your Consultation
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            Select a date and time that works for you
          </p>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {showBookingSuccess && (
          <div style={{
            padding: '24px',
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '16px',
            marginBottom: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowBookingSuccess(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                color: '#10b981',
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
                  Booking Request Submitted!
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#047857',
                  margin: 0
                }}>
                  Our PT team is reviewing your request. You'll receive a confirmation email once it's approved.
                </p>
              </div>
            </div>
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #86efac'
            }}>
              <button
                onClick={() => {
                  setShowBookingSuccess(false);
                  navigate(`/expert-coaching/consultations/${consultationId}`);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                View Consultation Details
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}>
          {/* Calendar Section - Fixed width */}
          <div style={{
            width: '650px',
            flexShrink: 0,
            padding: '40px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <CalendarView
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
            />
          </div>
          
          {/* Time Slots Section */}
          {selectedDate && (
            <div style={{
              flex: '0 0 400px',
              padding: '32px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              position: 'sticky',
              top: '20px',
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#111827'
                }}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280',
                  margin: 0
                }}>
                  Select an available time slot
                </p>
              </div>
              
              {loadingSlots ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: '#6b7280'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#10b981',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>Loading available times...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <p style={{ 
                    marginBottom: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    No available times
                  </p>
                  <p style={{ 
                    fontSize: '14px',
                    margin: 0
                  }}>
                    Please select a different date
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  marginBottom: '24px'
                }}>
                  {availableSlots.map((slot, index) => {
                    const slotStart = new Date(slot.start);
                    const slotEnd = new Date(slot.end);
                    const isSelected = selectedSlot?.start === slot.start;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '14px 16px',
                          border: `1.5px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                          borderRadius: '12px',
                          backgroundColor: isSelected 
                            ? '#10b981' 
                            : '#ffffff',
                          color: isSelected ? '#ffffff' : '#111827',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          fontWeight: isSelected ? '600' : '500',
                          fontSize: '15px',
                          boxShadow: isSelected 
                            ? '0 2px 8px rgba(16, 185, 129, 0.25)' 
                            : 'none',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#10b981';
                            e.currentTarget.style.backgroundColor = '#f0fdf4';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {slotStart.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true
                        })}
                      </button>
                    );
                  })}
                </div>
              )}
              
              {/* Selected Time Summary */}
              {selectedSlot && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #10b981',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      ✓
                    </div>
                    <span style={{ 
                      fontWeight: '600',
                      color: '#111827',
                      fontSize: '15px'
                    }}>
                      Time Selected
                    </span>
                  </div>
                  <p style={{ 
                    color: '#374151',
                    fontSize: '14px',
                    margin: 0,
                    paddingLeft: '36px',
                    lineHeight: '1.5'
                  }}>
                    {new Date(selectedSlot.start).toLocaleString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })} - {new Date(selectedSlot.end).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              )}
              
              {/* Book Button */}
              <button
                onClick={handleBookSlot}
                disabled={!selectedSlot || submitting}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: (!selectedSlot || submitting) ? '#d1d5db' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!selectedSlot || submitting) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: (!selectedSlot || submitting) ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (selectedSlot && !submitting) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedSlot && !submitting) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }
                }}
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PageContainer>
  );
};

export default ExpertCoachingBookingPage;

