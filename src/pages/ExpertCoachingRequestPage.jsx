import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import { API_ENDPOINTS } from '../config/api';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';

const ExpertCoachingRequestPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useRequireAuth(navigate);

  const [goals, setGoals] = useState('');
  const [questions, setQuestions] = useState('');
  const [notes, setNotes] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!goals.trim() || !questions.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!acknowledged) {
      setError('Please acknowledge to continue');
      return;
    }

    try {
      setSubmitting(true);
      const result = await authenticatedFetchJson(
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

      // Success - redirect to consultations page
      navigate(`/expert-coaching/consultations?created=${result.consultation_id}`);
    } catch (err) {
      console.error('Failed to create consultation:', err);
      setError(err.message || 'Failed to create consultation request');
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader title="Request Consultation" />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              What are your primary goals? *
            </label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g., Improve squat form, build strength, fix knee pain..."
              required
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              What questions or concerns do you have? *
            </label>
            <textarea
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder="e.g., How can I improve my deadlift form? What exercises help with lower back pain?"
              required
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information that might be helpful..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{
            padding: '20px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>
              Acknowledgment Required
            </h3>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '16px',
              color: 'var(--text-secondary)'
            }}>
              I understand that this is AI-generated guidance, not medical advice. I will consult a qualified healthcare provider if needed.
            </p>
            <label style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                style={{
                  marginTop: '4px',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                I acknowledge and agree to the above statement *
              </span>
            </label>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting || !acknowledged}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: (submitting || !acknowledged) ? '#ccc' : 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (submitting || !acknowledged) ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                flex: 1
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/expert-coaching')}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default ExpertCoachingRequestPage;

