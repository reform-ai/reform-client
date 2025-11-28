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
  const [warnings, setWarnings] = useState([]); // Store screening warnings
  const [currentStep, setCurrentStep] = useState(0); // 0 = detail level, 1-N = questions, last = review
  const [showReview, setShowReview] = useState(false);
  const [hasReachedReview, setHasReachedReview] = useState(false); // Track if user has seen review page
  
  // Organize questions into sections
  const [programTypeQuestion, setProgramTypeQuestion] = useState(null);
  const [parqQuestions, setParqQuestions] = useState([]);
  const [injuryQuestions, setInjuryQuestions] = useState([]);
  const [conditionalQuestions, setConditionalQuestions] = useState([]);

  useEffect(() => {
    if (!isUserLoggedIn()) {
      navigate('/?login=1');
      return;
    }

    fetchQuestionnaire();
  }, [navigate]);
  
  // Handle program_type changes - reset step if needed to show conditional questions
  useEffect(() => {
    // When program_type is selected, ensure we're showing the right questions
    // The getOrderedQuestions function handles this dynamically
    if (responses.program_type && currentStep > 0) {
      // If we're past program_type selection, we might need to adjust
      // But since questions are loaded, we can just continue
    }
  }, [responses.program_type]);


  const fetchQuestionnaire = async () => {
    try {
      setLoading(true);
      const data = await authenticatedFetchJson(
        API_ENDPOINTS.WORKOUT_PLANS_QUESTIONNAIRE,
        { method: 'GET' },
        navigate
      );
      const allQuestions = data.questions || [];
      setQuestions(allQuestions);
      
      // Organize questions into sections
      const programType = allQuestions.find(q => q.id === 'program_type');
      const parq = allQuestions.filter(q => q.id.startsWith('parq_'));
      const injury = allQuestions.filter(q => q.id.startsWith('injury_'));
      
      // Conditional questions (exclude program_type, PAR-Q+, injury)
      const conditional = allQuestions.filter(q => 
        q.id !== 'program_type' && 
        !q.id.startsWith('parq_') && 
        !q.id.startsWith('injury_')
      );
      
      setProgramTypeQuestion(programType || null);
      setParqQuestions(parq);
      setInjuryQuestions(injury);
      setConditionalQuestions(conditional);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch questionnaire:', err);
      setError(err.message || 'Failed to load questionnaire');
      setLoading(false);
    }
  };
  
  // Get ordered questions based on current program_type
  const getOrderedQuestions = () => {
    const ordered = [];
    
    // 1. Program type (always first)
    if (programTypeQuestion) {
      ordered.push(programTypeQuestion);
    }
    
    // 2. PAR-Q+ questions (always shown)
    ordered.push(...parqQuestions);
    
    // 3. Injury questions (always shown)
    ordered.push(...injuryQuestions);
    
    // 4. Conditional questions based on program_type
    const programType = responses.program_type;
    if (programType) {
      // Filter conditional questions based on program_type
      // For now, show all conditional questions (backend handles filtering)
      // In the future, we could filter client-side if needed
      ordered.push(...conditionalQuestions);
    } else {
      // If no program_type selected yet, show all conditional questions
      // (they'll be filtered once program_type is selected)
      ordered.push(...conditionalQuestions);
    }
    
    return ordered;
  };

  const validateAnswer = (question, answer) => {
    if (question.required && (answer === undefined || answer === '' || answer === null)) {
      return false;
    }
    
    if (question.type === 'multiple_choice') {
      return Array.isArray(answer) && answer.length > 0;
    }
    
    return true;
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    const orderedQuestions = getOrderedQuestions();
    
    if (currentStep === 0) {
      // Moving from detail level to first question
      setCurrentStep(1);
    } else if (currentStep < orderedQuestions.length) {
      // Moving to next question
      setCurrentStep(prev => prev + 1);
    } else {
      // Moving to review
      setShowReview(true);
      setHasReachedReview(true);
    }
  };

  const handlePrevious = () => {
    const orderedQuestions = getOrderedQuestions();
    
    if (showReview) {
      setShowReview(false);
      setCurrentStep(orderedQuestions.length);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  const canGoNext = () => {
    const orderedQuestions = getOrderedQuestions();
    
    if (currentStep === 0) {
      return detailLevel !== '';
    }
    
    if (currentStep > 0 && currentStep <= orderedQuestions.length) {
      const questionIndex = currentStep - 1;
      const question = orderedQuestions[questionIndex];
      const answer = responses[question?.id];
      return validateAnswer(question, answer);
    }
    
    return false;
  };

  const canGoPrevious = () => {
    if (showReview) return true;
    return currentStep > 0;
  };

  const handleEditQuestion = (questionIndex) => {
    setShowReview(false);
    setCurrentStep(questionIndex + 1);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validate all required questions
    const orderedQuestions = getOrderedQuestions();
    const requiredQuestions = orderedQuestions.filter(q => q.required);
    const missingRequired = requiredQuestions.filter(q => {
      const answer = responses[q.id];
      return !validateAnswer(q, answer);
    });
    
    if (missingRequired.length > 0) {
      setError(`Please answer all required questions: ${missingRequired.map(q => q.question).join(', ')}`);
      setShowReview(false);
      // Go to first missing question
      const firstMissing = orderedQuestions.findIndex(q => missingRequired.includes(q));
      setCurrentStep(firstMissing + 1);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setWarnings([]);

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

      // Extract warnings from response message if present
      if (result.message && result.message.includes('Warnings:')) {
        const warningsMatch = result.message.match(/Warnings: (.+)/);
        if (warningsMatch) {
          const warningsText = warningsMatch[1];
          const warningsList = warningsText.split('; ').filter(w => w.trim());
          setWarnings(warningsList);
          
          // Show warnings in an alert, then proceed
          if (warningsList.length > 0) {
            alert(`⚠️ Important Information:\n\n${warningsList.join('\n\n')}\n\nYou can still proceed with plan generation.`);
          }
        }
      }

      // Navigate to plan generation page
      navigate(`/workout-plans/generate?questionnaire_id=${result.questionnaire_id}`);
    } catch (err) {
      console.error('Failed to submit questionnaire:', err);
      setError(err.message || 'Failed to submit questionnaire');
      setSubmitting(false);
    }
  };

  const getCurrentQuestion = () => {
    const orderedQuestions = getOrderedQuestions();
    if (currentStep === 0 || currentStep > orderedQuestions.length) return null;
    return orderedQuestions[currentStep - 1];
  };

  const getProgress = () => {
    if (showReview) return 100;
    const orderedQuestions = getOrderedQuestions();
    const totalSteps = orderedQuestions.length + 1; // +1 for detail level
    return ((currentStep + 1) / totalSteps) * 100;
  };

  const renderDetailLevelSelection = () => {
    return (
      <div className="question-step">
        <div className="question-content">
          <h2 className="question-title">Choose Your Plan Detail Level</h2>
          <div className="detail-level-options">
            <button
              type="button"
              className={`detail-level-card ${detailLevel === 'high_level' ? 'selected' : ''}`}
              onClick={() => setDetailLevel('high_level')}
            >
              <h3>High Level</h3>
              <p>General workout structure and overview</p>
            </button>
            <button
              type="button"
              className={`detail-level-card ${detailLevel === 'exercise_level' ? 'selected' : ''}`}
              onClick={() => setDetailLevel('exercise_level')}
            >
              <h3>Exercise Level</h3>
              <p>Detailed exercise breakdown and instructions</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = (question) => {
    const value = responses[question.id];
    const isMultipleChoice = question.type === 'multiple_choice';

    switch (question.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value) || '')}
            className="question-input"
            min={question.id === 'weekly_frequency' ? 2 : undefined}
            max={question.id === 'weekly_frequency' ? 7 : undefined}
            required={question.required}
            autoFocus
          />
        );

      case 'select':
        // Experience level tooltips
        const experienceTooltips = {
          'beginner': '~6 months of lifting experience',
          'novice': '~2 years of lifting experience; progress without plateau',
          'intermediate': '2+ years of lifting experience; hit first plateau',
          'advanced': '5+ years of lifting experience; can adapt and get out of plateau',
          'elite': '5-10+ years of lifting experience; competitive athlete'
        };
        
        // Training split descriptions
        const trainingSplitDescriptions = {
          'full_body': 'Train all muscle groups in each session',
          'upper_lower': 'Alternate between upper and lower body',
          'push_pull_legs': 'Push movements, pull movements, and legs',
          'bro_split': 'One muscle group per day'
        };
        
        // Training split titles (properly formatted)
        const trainingSplitTitles = {
          'full_body': 'Full Body',
          'upper_lower': 'Upper Lower',
          'push_pull_legs': 'Push-Pull-Legs',
          'bro_split': 'Bro Split'
        };
        
        // Program type descriptions
        const programTypeDescriptions = {
          'strength_training': 'Build muscle and strength with progressive resistance training',
          'mobility_stability': 'Improve flexibility, balance, and movement quality',
          'recovery_focused': 'Gentle movement and recovery for pain management and rehabilitation'
        };
        
        // Program type titles
        const programTypeTitles = {
          'strength_training': 'Strength Training',
          'mobility_stability': 'Mobility & Stability',
          'recovery_focused': 'Recovery Focused'
        };
        
        // Check if this should use card style (like detail level)
        const useCardStyle = question.id === 'experience_level' || 
                            question.id === 'training_split_preference' || 
                            question.id === 'program_type';
        
        if (useCardStyle) {
          return (
            <div className="select-options-card">
              {question.options?.map(option => {
                const isSelected = value === option;
                let title = '';
                let description = '';
                
                if (question.id === 'experience_level') {
                  title = option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ');
                  description = experienceTooltips[option] || '';
                } else if (question.id === 'training_split_preference') {
                  title = trainingSplitTitles[option] || option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ');
                  description = trainingSplitDescriptions[option] || '';
                } else if (question.id === 'program_type') {
                  title = programTypeTitles[option] || option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ');
                  description = programTypeDescriptions[option] || '';
                }
                
                return (
                  <button
                    key={option}
                    type="button"
                    className={`select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleResponseChange(question.id, option)}
                  >
                    <h3>{title}</h3>
                    {description && <p>{description}</p>}
                  </button>
                );
              })}
            </div>
          );
        }
        
        return (
          <div className="select-options">
            {question.options?.map(option => {
              // Format display text based on question type
              let displayText = option;
              if (question.id === 'plan_duration_weeks' || question.id === 'time_per_session') {
                displayText = option; // Already formatted
              } else if (question.id === 'parq_heart_condition' || 
                        question.id === 'parq_chest_pain' || 
                        question.id === 'parq_dizziness' || 
                        question.id === 'parq_medical_conditions' || 
                        question.id === 'parq_doctor_restriction' ||
                        question.id === 'injury_current_pain') {
                // PAR-Q+ and injury questions use yes/no
                displayText = option === 'yes' ? 'Yes' : 'No';
              } else {
                displayText = option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ');
              }
              
              return (
                <button
                  key={option}
                  type="button"
                  className={`select-option ${value === option ? 'selected' : ''}`}
                  onClick={() => handleResponseChange(question.id, option)}
                >
                  {displayText}
                </button>
              );
            })}
          </div>
        );

      case 'multiple_choice':
        const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
        const allOptions = question.options || [];
        const hasSelectAll = ['weekly_frequency', 'equipment_available', 'goals'].includes(question.id);
        
        // Separate regular options from special options (none, select_all)
        const regularOptions = allOptions.filter(opt => opt !== 'none');
        const hasNone = allOptions.includes('none');
        // Check if all regular options are selected (excluding "none")
        const allSelected = regularOptions.length > 0 && regularOptions.every(opt => selectedValues.includes(opt));
        
        return (
          <div className="multiple-choice-options">
            {regularOptions.map(option => {
              const isSelected = selectedValues.includes(option);
              
              return (
                <button
                  key={option}
                  type="button"
                  className={`multiple-choice-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    // For regular options, if "none" is selected, remove it first
                    let newValues = selectedValues.filter(v => v !== 'none');
                    if (isSelected) {
                      newValues = newValues.filter(v => v !== option);
                    } else {
                      newValues = [...newValues, option];
                    }
                    handleResponseChange(question.id, newValues);
                  }}
                >
                  <div className="checkbox-indicator">
                    {isSelected && <span className="checkmark">✓</span>}
                  </div>
                  <span>{option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ')}</span>
                </button>
              );
            })}
            {hasNone && (
              <button
                key="none"
                type="button"
                className={`multiple-choice-card none-option ${selectedValues.includes('none') ? 'selected' : ''}`}
                onClick={() => {
                  // If "none" is clicked, toggle it and clear others
                  if (selectedValues.includes('none')) {
                    handleResponseChange(question.id, []);
                  } else {
                    handleResponseChange(question.id, ['none']);
                  }
                }}
              >
                <div className="checkbox-indicator">
                  {selectedValues.includes('none') && <span className="checkmark">✓</span>}
                </div>
                <span className="bold-text">None</span>
              </button>
            )}
            {hasSelectAll && (
              <button
                type="button"
                className={`multiple-choice-card select-all-card ${allSelected ? 'selected' : ''}`}
                onClick={() => {
                  if (allSelected) {
                    // Deselect all
                    handleResponseChange(question.id, []);
                  } else {
                    // Select all (excluding "none" if it exists)
                    const optionsToSelect = hasNone ? regularOptions : allOptions;
                    handleResponseChange(question.id, [...optionsToSelect]);
                  }
                }}
              >
                <div className="checkbox-indicator">
                  {allSelected && <span className="checkmark">✓</span>}
                </div>
                <span className="bold-text">Select All</span>
              </button>
            )}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="question-textarea"
            rows={4}
            placeholder="Enter your response..."
            required={question.required}
            autoFocus
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="question-input"
            required={question.required}
            autoFocus
          />
        );
    }
  };

  const renderReview = () => {
    const orderedQuestions = getOrderedQuestions();
    
    return (
      <div className="review-step">
        <h2 className="review-title">Review Your Answers</h2>
        <p className="review-subtitle">Review your answers before submitting. Click any answer to edit.</p>
        
        {warnings.length > 0 && (
          <div className="warning-container">
            <h3 className="warning-title">⚠️ Important Information</h3>
            {warnings.map((warning, idx) => (
              <div key={idx} className="warning-message">{warning}</div>
            ))}
          </div>
        )}
        
        <div className="review-section">
          <div className="review-item">
            <label className="review-label">Plan Detail Level</label>
            <button
              type="button"
              className="review-value editable"
              onClick={() => handleEditQuestion(-1)}
            >
              {detailLevel === 'high_level' ? 'High Level' : 'Exercise Level'}
            </button>
          </div>

          {orderedQuestions.map((question, index) => {
            const answer = responses[question.id];
            let displayValue = '';
            
            if (Array.isArray(answer)) {
              displayValue = answer.map(v => {
                // Format days of week and other multi-word options
                return v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' ');
              }).join(', ');
            } else if (answer !== undefined && answer !== null && answer !== '') {
              if (question.type === 'select') {
                // Format select options nicely
                if (question.id === 'plan_duration_weeks') {
                  displayValue = answer; // Already formatted as "2-4 weeks"
                } else if (question.id === 'time_per_session') {
                  displayValue = answer; // Already formatted as "10-15min"
                } else if (question.id === 'training_split_preference') {
                  // Use proper formatting for training split
                  const trainingSplitTitles = {
                    'full_body': 'Full Body',
                    'upper_lower': 'Upper Lower',
                    'push_pull_legs': 'Push-Pull-Legs',
                    'bro_split': 'Bro Split'
                  };
                  displayValue = trainingSplitTitles[answer] || answer.charAt(0).toUpperCase() + answer.slice(1).replace(/_/g, ' ');
                } else if (question.id === 'program_type') {
                  const programTypeTitles = {
                    'strength_training': 'Strength Training',
                    'mobility_stability': 'Mobility & Stability',
                    'recovery_focused': 'Recovery Focused'
                  };
                  displayValue = programTypeTitles[answer] || answer.charAt(0).toUpperCase() + answer.slice(1).replace(/_/g, ' ');
                } else if (question.id.startsWith('parq_') || question.id === 'injury_current_pain') {
                  // PAR-Q+ and injury yes/no questions
                  displayValue = answer === 'yes' ? 'Yes' : 'No';
                } else {
                  displayValue = answer.charAt(0).toUpperCase() + answer.slice(1).replace(/_/g, ' ');
                }
              } else {
                displayValue = String(answer);
              }
            } else {
              displayValue = 'Not answered';
            }

            return (
              <div key={question.id} className="review-item">
                <label className="review-label">{question.question}</label>
                <button
                  type="button"
                  className="review-value editable"
                  onClick={() => handleEditQuestion(index)}
                >
                  {displayValue}
                </button>
              </div>
            );
          })}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="review-actions">
          <button
            type="button"
            onClick={handlePrevious}
            className="nav-button previous-button"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit & Generate Plan'}
          </button>
        </div>
      </div>
    );
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

  if (error && !submitting && questions.length === 0) {
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

  const orderedQuestions = getOrderedQuestions();
  const totalSteps = orderedQuestions.length + 1; // +1 for detail level
  const currentQuestion = getCurrentQuestion();

  return (
    <PageContainer>
      <PageHeader title="Create Your Workout Plan" />
      <div className="questionnaire-container">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {showReview 
              ? 'Review' 
              : currentStep === 0 
                ? 'Step 1 of ' + totalSteps 
                : `Step ${currentStep + 1} of ${totalSteps}`
            }
          </div>
        </div>

        {/* Question Steps */}
        {!showReview && (
          <div className="question-step-container">
            {currentStep === 0 && renderDetailLevelSelection()}
            {currentStep > 0 && currentQuestion && (
              <div className="question-step">
                <div className="question-content">
                  <h2 className="question-title">
                    {currentQuestion.question}
                    {currentQuestion.required && <span className="required"> *</span>}
                  </h2>
                  {renderQuestion(currentQuestion)}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="navigation-container">
              <button
                type="button"
                onClick={handlePrevious}
                className="nav-button previous-button"
                disabled={!canGoPrevious()}
              >
                ← Previous
              </button>
              {showReview === false && currentStep > 0 && hasReachedReview && (
                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  className="nav-button finish-button"
                >
                  Finish
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="nav-button next-button"
                disabled={!canGoNext()}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Review Step */}
        {showReview && renderReview()}
      </div>
    </PageContainer>
  );
};

export default WorkoutPlanQuestionnairePage;
