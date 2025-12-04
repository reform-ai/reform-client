import React, { useState, useEffect } from 'react';
import { authenticatedFetchJson } from '../../utils/authenticatedFetch';
import { API_ENDPOINTS } from '../../../config/api';

const PARQComponent = ({ consultationId, onComplete, navigate }) => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_PARQ_QUESTIONS,
        { method: 'GET' },
        navigate
      );
      setQuestions(data.questions || []);
      
      // Initialize responses with 'no' for all questions
      const initialResponses = {};
      data.questions?.forEach(q => {
        initialResponses[q.id] = 'no';
      });
      setResponses(initialResponses);
    } catch (err) {
      console.error('Failed to fetch PAR-Q questions:', err);
      setError(err.message || 'Failed to load PAR-Q questions');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all required questions are answered
    const unanswered = questions.filter(q => q.required && !responses[q.id]);
    if (unanswered.length > 0) {
      setError('Please answer all questions');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const result = await authenticatedFetchJson(
        API_ENDPOINTS.EXPERT_COACHING_PARQ_SUBMIT(consultationId),
        {
          method: 'POST',
          body: JSON.stringify(responses)
        },
        navigate
      );

      // Extract warnings from response message
      if (result.message && result.message.includes('Warnings:')) {
        const warningsMatch = result.message.match(/Warnings: (.+)/);
        if (warningsMatch) {
          const warningsText = warningsMatch[1];
          const warningsList = warningsText.split('; ').filter(w => w.trim());
          setWarnings(warningsList);
        }
      }

      // Check for any "yes" answers to show warning
      const hasYesAnswers = Object.values(responses).some(v => v === 'yes');
      if (hasYesAnswers) {
        setWarnings(prev => [
          ...prev,
          'You answered "yes" to one or more PAR-Q questions. Please consult with a healthcare provider before starting any exercise program.'
        ]);
      }

      if (onComplete) {
        onComplete(result, warnings);
      }
    } catch (err) {
      console.error('Failed to submit PAR-Q:', err);
      setError(err.message || 'Failed to submit PAR-Q responses');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading PAR-Q questions...</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-primary)',
      marginBottom: '24px'
    }}>
      <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
        Health Screening
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Complete this optional health screening questionnaire to help us provide better guidance.
      </p>

      {warnings.length > 0 && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>⚠️ Important Information:</strong>
          {warnings.map((warning, idx) => (
            <div key={idx} style={{ marginBottom: '4px', fontSize: '14px' }}>{warning}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {questions.map((question) => (
          <div key={question.id} style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {question.question}
              {question.required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {question.options?.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleResponseChange(question.id, option)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: responses[question.id] === option ? 'var(--primary-color)' : 'transparent',
                    color: responses[question.id] === option ? 'white' : 'var(--text-primary)',
                    border: `1px solid ${responses[question.id] === option ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: responses[question.id] === option ? '600' : '400'
                  }}
                >
                  {option === 'yes' ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>
        ))}

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: submitting ? '#ccc' : 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default PARQComponent;

