import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../../shared/utils/useRequireAuth';
import { authenticatedFetchJson } from '../../../shared/utils/authenticatedFetch';
import { API_ENDPOINTS } from '../../../config/api';
import PageContainer from '../../../shared/components/layout/PageContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
import './ExpertCoachingRequestPage.css';

// Calendar Component (from ExpertCoachingBookingPage)
const CalendarView = ({ currentMonth, setCurrentMonth, selectedDate, onDateClick, availabilityMap }) => {
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
  
  const isWeekend = (date) => {
    if (!date) return false;
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  };
  
  const isLessThan24HoursAway = (date) => {
    if (!date) return false;
    const now = new Date();
    const dateTime = new Date(date);
    dateTime.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return dateTime < tomorrow;
  };
  
  const isDisabled = (date) => {
    if (isPastDate(date) || isWeekend(date) || isLessThan24HoursAway(date)) {
      return true;
    }
    const availability = hasAvailability(date);
    return availability === false;
  };

  const getDateKey = (date) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const hasAvailability = (date) => {
    if (!date || !availabilityMap) return null;
    const dateKey = getDateKey(date);
    const availability = availabilityMap[dateKey];
    if (availability === undefined) return null;
    return availability && availability.length > 0;
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
          const isDisabledDate = isDisabled(date);
          const dateHasAvailability = hasAvailability(date);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => !isDisabledDate && onDateClick(date)}
              disabled={isDisabledDate}
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
                    : isDisabledDate 
                      ? '#f9fafb' 
                      : dateHasAvailability === false
                        ? '#fee2e2'
                        : '#ffffff',
                color: isSelected 
                  ? '#ffffff' 
                  : isDisabledDate 
                    ? '#d1d5db' 
                    : '#111827',
                cursor: isDisabledDate ? 'not-allowed' : 'pointer',
                fontWeight: isSelected || isToday ? '600' : '400',
                fontSize: '16px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: '60px',
                opacity: isDisabledDate ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isDisabledDate && !isSelected) {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabledDate && !isSelected) {
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
              {!isDisabledDate && !isToday && dateHasAvailability === true && (
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }} />
              )}
              {!isDisabledDate && !isToday && dateHasAvailability === false && (
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444'
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ExpertCoachingRequestPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useRequireAuth(navigate);

  // Step management
  const [currentStep, setCurrentStep] = useState(0); // 0: Waiver+PAR-Q, 1: Booking, 2: Confirmation
  
  // Step 1: Waiver + PAR-Q
  const [goals, setGoals] = useState('');
  const [questions, setQuestions] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [showAcknowledgmentPopup, setShowAcknowledgmentPopup] = useState(false);
  const [parqQuestions, setParqQuestions] = useState([]);
  const [parqResponses, setParqResponses] = useState({});
  const [parqLoading, setParqLoading] = useState(true);
  
  // Step 2: Booking
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityMap, setAvailabilityMap] = useState({});
  
  // Step 3: Confirmation
  const [notes, setNotes] = useState('');
  
  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Check if voucher has been validated
    const voucherValidated = sessionStorage.getItem('expert_coaching_voucher_validated');
    if (!voucherValidated) {
      navigate('/expert-coaching/voucher');
      return;
    }
    
    fetchParqQuestions();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Preload availability when user is on Step 1 (booking) or Step 0 (health screening)
    // This ensures data is ready when they reach the booking page
    if (currentStep === 0 || currentStep === 1) {
      preloadAvailability();
    }
  }, [currentStep]);

  const preloadAvailability = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const datesToCheck = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        datesToCheck.push(date);
      }
    }

    const newAvailabilityMap = {};
    
    for (const date of datesToCheck) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const url = new URL(API_ENDPOINTS.EXPERT_COACHING_AVAILABILITY);
        url.searchParams.append('start_date', startOfDay.toISOString());
        url.searchParams.append('end_date', endOfDay.toISOString());
        url.searchParams.append('duration_minutes', '30');
        url.searchParams.append('timezone', timezone);
        
        const data = await authenticatedFetchJson(
          url.toString(),
          { method: 'GET' },
          navigate
        );
        
        const slots = data.available_slots || [];
        const now = new Date();
        const filteredSlots = slots.filter(slot => {
          const slotStart = new Date(slot.start);
          const hoursUntilSlot = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);
          return hoursUntilSlot >= 24;
        });
        
        newAvailabilityMap[dateKey] = filteredSlots.length > 0 ? filteredSlots : false;
      } catch (err) {
        console.error(`Failed to preload availability for ${dateKey}:`, err);
        newAvailabilityMap[dateKey] = false;
      }
    }
    
    setAvailabilityMap(prev => ({ ...prev, ...newAvailabilityMap }));
  };

  const fetchParqQuestions = async () => {
    try {
      setParqLoading(true);
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_PARQ_QUESTIONS,
        { method: 'GET' },
        navigate
      );
      setParqQuestions(data.questions || []);
      
      // Initialize responses as empty (NOT pre-filled)
      const initialResponses = {};
      data.questions?.forEach(q => {
        initialResponses[q.id] = null; // Start with null (unanswered)
      });
      setParqResponses(initialResponses);
    } catch (err) {
      console.error('Failed to fetch PAR-Q questions:', err);
      setError(err.message || 'Failed to load PAR-Q questions');
    } finally {
      setParqLoading(false);
    }
  };

  const handleParqResponseChange = (questionId, value) => {
    setParqResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const cachedSlots = availabilityMap[dateKey];
    
    if (cachedSlots && Array.isArray(cachedSlots)) {
      setAvailableSlots(cachedSlots);
      return;
    }
    
    setLoadingSlots(true);
    
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const url = new URL(API_ENDPOINTS.EXPERT_COACHING_AVAILABILITY);
      url.searchParams.append('start_date', startOfDay.toISOString());
      url.searchParams.append('end_date', endOfDay.toISOString());
      url.searchParams.append('duration_minutes', '30');
      url.searchParams.append('timezone', timezone);
      
      const data = await authenticatedFetchJson(
        url.toString(),
        { method: 'GET' },
        navigate
      );
      
      const slots = data.available_slots || [];
      const now = new Date();
      const filteredSlots = slots.filter(slot => {
        const slotStart = new Date(slot.start);
        const hoursUntilSlot = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilSlot >= 24;
      });
      
      setAvailableSlots(filteredSlots);
      setAvailabilityMap(prev => ({ ...prev, [dateKey]: filteredSlots.length > 0 ? filteredSlots : false }));
      setLoadingSlots(false);
    } catch (err) {
      console.error('Failed to fetch available slots:', err);
      setError(err.message || 'Failed to load available time slots');
      setLoadingSlots(false);
    }
  };

  const canGoNext = () => {
    if (currentStep === 0) {
      // Step 1: Health Screening
      // All questions must be answered (all are required)
      // Acknowledgment is handled separately via popup
      return parqQuestions.every(q => parqResponses[q.id] !== null && parqResponses[q.id] !== undefined && parqResponses[q.id] !== '');
    } else if (currentStep === 1) {
      // Step 2: Booking
      // Check that slot is selected and is at least 24 hours away
      if (!selectedSlot) return false;
      const now = new Date();
      const slotStart = new Date(selectedSlot.start);
      const hoursUntilSlot = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilSlot >= 24;
    } else if (currentStep === 2) {
      // Step 3: Confirmation (goals, questions required, notes optional)
      return goals.trim() && questions.trim();
    }
    return false;
  };

  const handleNext = () => {
    if (currentStep === 0 && canGoNext()) {
      // Step 1: Check if acknowledgment is needed
      if (!acknowledged) {
        // Show popup if not acknowledged
        setShowAcknowledgmentPopup(true);
      } else {
        // Already acknowledged, proceed to next step
        setCurrentStep(1);
        setError(null);
      }
    } else if (currentStep < 2 && canGoNext()) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleAcknowledgmentContinue = () => {
    if (acknowledged) {
      setShowAcknowledgmentPopup(false);
      setCurrentStep(1);
      setError(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!canGoNext()) return;
    
    setError(null);
    setSubmitting(true);

    try {
      // Create a new endpoint that does everything in one call
      // For now, let's call the existing endpoints sequentially
      // 1. Create consultation
      const consultationResult = await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_REQUEST,
        {
          method: 'POST',
          body: JSON.stringify({
            goals: goals.trim(),
            questions: questions.trim(),
            notes: notes.trim() || null,
            acknowledged: true
          })
        },
        navigate
      );

      const consultationId = consultationResult.consultation_id;

      // 2. Submit PAR-Q
      await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_PARQ_SUBMIT(consultationId),
        {
          method: 'POST',
          body: JSON.stringify(parqResponses)
        },
        navigate
      );

      // 3. Request booking
      await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_BOOK(consultationId),
        {
          method: 'POST',
          body: JSON.stringify({
            start_time: selectedSlot.start,
            end_time: selectedSlot.end
          })
        },
        navigate
      );

      // 4. Navigate to confirmation page
      navigate(`/expert-coaching/consultations/${consultationId}?completed=true`);
    } catch (err) {
      console.error('Failed to submit consultation request:', err);
      setError(err.message || 'Failed to submit consultation request');
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const getProgress = () => {
    return ((currentStep + 1) / 3) * 100;
  };

  return (
    <PageContainer>
      <PageHeader title="Request Consultation" />
      <div className="expert-coaching-request-container">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Step {currentStep + 1} of 3
          </div>
        </div>

        {/* Step 1: Health Screening + Waiver */}
        {currentStep === 0 && (
          <div className="request-step">
            <h2 className="step-title">Health Screening & Waiver</h2>
            
            {/* PAR-Q Component */}
            {parqLoading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading health screening questions...</p>
              </div>
            ) : (
              <div style={{
                padding: '24px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-primary)',
                marginBottom: '32px'
              }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
                  Health Screening
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Complete this health screening questionnaire.
                </p>

                {parqQuestions.map((question) => {
                  const isSelected = parqResponses[question.id] !== null && parqResponses[question.id] !== undefined;
                  const isUnanswered = parqResponses[question.id] === null || parqResponses[question.id] === undefined;
                  
                  return (
                    <div key={question.id} style={{ 
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <label style={{
                        flex: 1,
                        fontWeight: '600',
                        fontSize: '16px',
                        margin: 0
                      }}>
                        {question.question}
                        <span style={{ color: '#ef4444' }}> *</span>
                      </label>
                      <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                        {question.options?.map(option => {
                          const isOptionSelected = parqResponses[question.id] === option;
                          const isYes = option === 'yes';
                          const isNo = option === 'no';
                          
                          // Determine colors based on selection and option type
                          let backgroundColor, borderColor, textColor;
                          
                          if (isOptionSelected) {
                            if (isYes) {
                              // "Yes" selected - red
                              backgroundColor = '#ef4444';
                              borderColor = '#ef4444';
                              textColor = 'white';
                            } else if (isNo) {
                              // "No" selected - green
                              backgroundColor = '#10b981';
                              borderColor = '#10b981';
                              textColor = 'white';
                            }
                          } else {
                            // Not selected
                            backgroundColor = 'transparent';
                            borderColor = isUnanswered ? '#d1d5db' : 'var(--border-color)';
                            textColor = 'var(--text-primary)';
                          }
                          
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleParqResponseChange(question.id, option)}
                              className="parq-option-button"
                              style={{
                                padding: '12px 24px',
                                fontSize: '15px',
                                minHeight: '44px',
                                backgroundColor: backgroundColor,
                                color: textColor,
                                border: `2px solid ${borderColor}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: isOptionSelected ? '600' : '400',
                                transition: 'all 0.2s',
                                opacity: isUnanswered ? 0.7 : 1
                              }}
                            >
                              {isYes ? 'Yes' : 'No'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* Step 2: Booking Calendar */}
        {currentStep === 1 && (
          <div className="request-step">
            <h2 className="step-title">Select Your Time</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Choose a date and time for your consultation
            </p>
            
            {/* Main Content - Fixed widths, side by side */}
            <div style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start'
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
                  availabilityMap={availabilityMap}
                />
              </div>
              
              {/* Time Slots Section - Fixed width */}
              <div style={{
                width: '400px',
                flexShrink: 0,
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
                {selectedDate ? (
                  <>
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
                        gap: '10px'
                      }}>
                        {availableSlots.map((slot, idx) => {
                          const slotStart = new Date(slot.start);
                          const slotEnd = new Date(slot.end);
                          const isSelected = selectedSlot && 
                            selectedSlot.start === slot.start;
                          
                          const now = new Date();
                          const hoursUntilSlot = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);
                          const isLessThan24Hours = hoursUntilSlot < 24;
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => !isLessThan24Hours && setSelectedSlot(slot)}
                              disabled={isLessThan24Hours}
                              style={{
                                padding: '14px 16px',
                                border: `1.5px solid ${isSelected ? '#10b981' : (isLessThan24Hours ? '#ef4444' : '#e5e7eb')}`,
                                borderRadius: '12px',
                                backgroundColor: isSelected 
                                  ? '#10b981' 
                                  : isLessThan24Hours
                                    ? '#fef2f2'
                                    : '#ffffff',
                                color: isSelected 
                                  ? '#ffffff' 
                                  : isLessThan24Hours
                                    ? '#ef4444'
                                    : '#111827',
                                cursor: isLessThan24Hours ? 'not-allowed' : 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                                fontWeight: isSelected ? '600' : '500',
                                fontSize: '15px',
                                boxShadow: isSelected 
                                  ? '0 2px 8px rgba(16, 185, 129, 0.25)' 
                                  : 'none',
                                position: 'relative',
                                opacity: isLessThan24Hours ? 0.7 : 1
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected && !isLessThan24Hours) {
                                  e.currentTarget.style.borderColor = '#10b981';
                                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected && !isLessThan24Hours) {
                                  e.currentTarget.style.borderColor = '#e5e7eb';
                                  e.currentTarget.style.backgroundColor = '#ffffff';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }
                              }}
                            >
                              <span style={{
                                textDecoration: isLessThan24Hours ? 'line-through' : 'none',
                                color: isLessThan24Hours ? '#ef4444' : 'inherit'
                              }}>
                                {slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    <p style={{ 
                      fontSize: '14px',
                      margin: 0
                    }}>
                      Select a date to view available times
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 2 && (
          <div className="request-step">
            <h2 className="step-title">Confirm Your Request</h2>
            
            <div style={{ marginBottom: '32px' }}>
              <label className="form-label">
                What are your primary goals? *
              </label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g., Improve squat form, build strength, fix knee pain..."
                required
                rows={4}
                className="form-textarea"
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label className="form-label">
                What questions or concerns do you have? *
              </label>
              <textarea
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                placeholder="e.g., How can I improve my deadlift form? What exercises help with lower back pain?"
                required
                rows={4}
                className="form-textarea"
              />
            </div>

            <div style={{
              padding: '24px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
                Consultation Details
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <strong>Duration:</strong> 30 minutes
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Scheduled Time:</strong> {selectedSlot && (
                  <span>
                    {new Date(selectedSlot.start).toLocaleString([], {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                marginTop: '16px',
                color: '#856404'
              }}>
                <strong>Cancellation Policy:</strong> Please cancel at least 24 hours in advance.
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#d1ecf1',
                border: '1px solid #0c5460',
                borderRadius: '8px',
                marginTop: '16px',
                color: '#0c5460'
              }}>
                <strong>Note:</strong> Your PT will review and confirm your booking request soon. You'll receive an email confirmation once approved.
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information that might be helpful..."
                rows={4}
                className="form-textarea"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
            {error.includes('already have an active consultation') && (
              <button
                onClick={() => navigate('/expert-coaching/consultations')}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'block',
                  width: '100%'
                }}
              >
                View My Consultations
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="navigation-container">
          <button
            type="button"
            onClick={handlePrevious}
            className="nav-button previous-button"
            disabled={currentStep === 0}
          >
            ← Previous
          </button>
          
          {currentStep < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="nav-button next-button sticky-continue"
              disabled={!canGoNext()}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="nav-button submit-button sticky-continue"
              disabled={!canGoNext() || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          )}
        </div>
      </div>

      {/* Acknowledgment Popup */}
      {showAcknowledgmentPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={(e) => {
          // Close popup if clicking on backdrop (but not on the popup content itself)
          if (e.target === e.currentTarget) {
            // Don't allow closing by clicking backdrop - user must acknowledge
          }
        }}
        >
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--border-color)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              fontSize: '20px', 
              marginBottom: '16px', 
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Acknowledgment Required
            </h3>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '24px',
              color: 'var(--text-secondary)'
            }}>
              • The PT consultation establishes a PT-client relationship solely for the duration of the consultation call.<br/><br/>
              • Form analysis and scheduling remain AI-generated unless fully modified during the PT consultation, and are subject to the Terms of Service.<br/><br/>
              • I will consult a qualified healthcare provider when necessary.
            </p>
            <label style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              cursor: 'pointer',
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: `2px solid ${acknowledged ? '#10b981' : 'var(--border-color)'}`
            }}>
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                style={{
                  marginTop: '2px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                I acknowledge and agree to the above statement *
              </span>
            </label>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleAcknowledgmentContinue}
                disabled={!acknowledged}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: acknowledged ? '#10b981' : '#d1d5db',
                  color: acknowledged ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: acknowledged ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (acknowledged) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (acknowledged) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ExpertCoachingRequestPage;
