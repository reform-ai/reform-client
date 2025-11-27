import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import { isUserLoggedIn } from '../shared/utils/authStorage';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import './WorkoutPlanQuestionnairePage.css';

const WorkoutPlanQuestionnairePage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [detailLevel, setDetailLevel] = useState('high_level');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isUserLoggedIn()) {
      navigate('/?login=1');
      return;
    }

    fetchQuestionnaire();
  }, [navigate]);

  const fetchQuestionnaire = async () => {
    try {
      setLoading(true);
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.WORKOUT_PLANS_QUESTIONNAIRE,
        { method: 'GET' },
        navigate
      );
      setQuestions(data.questions || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch questionnaire:', err);
      setError(err.message || 'Failed to load questionnaire');
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
    
    // Validate required questions
    const requiredQuestions = questions.filter(q => q.required);
    const missingRequired = requiredQuestions.filter(q => !responses[q.id]);
    
    if (missingRequired.length > 0) {
      setError(`Please answer all required questions: ${missingRequired.map(q => q.question).join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const result = await authenticatedFetchJson(
        API_ENDPOINTS.WORKOUT_PLANS_SUBMIT,
        {
          method: 'POST',
          body: JSON.stringify({
            responses,
            detail_level: detailLevel
          })
        },
        navigate
      );

      // Navigate to plan generation page
      navigate(`/workout-plans/generate?questionnaire_id=${result.questionnaire_id}`);
    } catch (err) {
      console.error('Failed to submit questionnaire:', err);
      setError(err.message || 'Failed to submit questionnaire');
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value) || '')}
            className="question-input"
            min={question.id === 'weekly_frequency' ? 2 : undefined}
            max={question.id === 'weekly_frequency' ? 7 : undefined}
            required={question.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="question-select"
            required={question.required}
          >
            <option value="">Select an option...</option>
            {question.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        );

      case 'multiple_choice':
        const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
        return (
          <div className="multiple-choice-options">
            {question.options?.map(option => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    handleResponseChange(question.id, newValues);
                  }}
                />
                <span>{option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="question-textarea"
            rows={4}
            placeholder="Enter your response..."
            required={question.required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="question-input"
            required={question.required}
          />
        );
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Workout Plan Questionnaire" />
        <div className="loading-container">
          <p>Loading questionnaire...</p>
        </div>
      </PageContainer>
    );
  }

  if (error && !submitting) {
    return (
      <PageContainer>
        <PageHeader title="Workout Plan Questionnaire" />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchQuestionnaire} className="retry-button">
            Retry
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Create Your Workout Plan" />
      <div className="questionnaire-container">
        <form onSubmit={handleSubmit} className="questionnaire-form">
          {/* Detail Level Selection */}
          <div className="question-group">
            <label className="question-label">
              Plan Detail Level
            </label>
            <div className="detail-level-options">
              <label className="radio-label">
                <input
                  type="radio"
                  value="high_level"
                  checked={detailLevel === 'high_level'}
                  onChange={(e) => setDetailLevel(e.target.value)}
                />
                <span>High Level - General workout structure</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="exercise_level"
                  checked={detailLevel === 'exercise_level'}
                  onChange={(e) => setDetailLevel(e.target.value)}
                />
                <span>Exercise Level - Detailed exercise breakdown</span>
              </label>
            </div>
          </div>

          {/* Questions */}
          {questions.map((question, index) => (
            <div key={question.id} className="question-group">
              <label className="question-label">
                {question.question}
                {question.required && <span className="required"> *</span>}
              </label>
              {renderQuestion(question)}
            </div>
          ))}

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Continue to Generate Plan'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default WorkoutPlanQuestionnairePage;

