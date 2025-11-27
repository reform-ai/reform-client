import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import { isUserLoggedIn } from '../shared/utils/authStorage';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import './WorkoutPlanGeneratePage.css';

const WorkoutPlanGeneratePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionnaireId = searchParams.get('questionnaire_id');
  
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isUserLoggedIn()) {
      navigate('/?login=1');
      return;
    }

    if (!questionnaireId) {
      navigate('/workout-plans/questionnaire');
      return;
    }

    // Auto-generate plan when page loads
    generatePlan();
  }, [navigate, questionnaireId]);

  const generatePlan = async () => {
    try {
      setGenerating(true);
      setError(null);

      const result = await authenticatedFetchJson(
        API_ENDPOINTS.WORKOUT_PLANS_GENERATE,
        {
          method: 'POST',
          body: JSON.stringify({
            questionnaire_id: questionnaireId
          })
        },
        navigate
      );

      // Navigate to plan viewer
      navigate(`/workout-plans/${result.plan_id}`);
    } catch (err) {
      console.error('Failed to generate plan:', err);
      setError(err.message || 'Failed to generate workout plan');
      setGenerating(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Generating Your Workout Plan" />
      <div className="generate-container">
        {generating && (
          <div className="generating-content">
            <div className="spinner"></div>
            <p className="generating-text">Creating your personalized workout plan...</p>
            <p className="generating-subtext">This may take a few moments</p>
          </div>
        )}

        {error && (
          <div className="error-content">
            <p className="error-text">{error}</p>
            <div className="error-actions">
              <button onClick={generatePlan} className="retry-button">
                Try Again
              </button>
              <button 
                onClick={() => navigate('/workout-plans/questionnaire')} 
                className="back-button"
              >
                Back to Questionnaire
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default WorkoutPlanGeneratePage;

