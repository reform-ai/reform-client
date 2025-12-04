import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';
import { authenticatedFetchJson } from '../../../shared/utils/authenticatedFetch';
import { isUserLoggedIn } from '../../../shared/utils/authStorage';
import PageContainer from '../../../shared/components/layout/PageContainer';
import PageHeader from '../../../shared/components/layout/PageHeader';
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
  const [currentStep, setCurrentStep] = useState(0); // 0 = first question (PAR-Q), last = detail level, then review
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
  
  // Handle program_type changes - when program_type is selected, ensure conditional questions update
  useEffect(() => {
    // When program_type changes, the getOrderedQuestions() will automatically filter correctly
    // We don't need to reset the step, just let it continue naturally
    // The conditional questions will be filtered based on the selected program_type
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
      // Deduplicate by question ID since common questions appear in multiple program types
      const conditional = allQuestions.filter(q => 
        q.id !== 'program_type' && 
        !q.id.startsWith('parq_') && 
        !q.id.startsWith('injury_')
      );
      
      // Deduplicate conditional questions by ID (keep first occurrence)
      const seenIds = new Set();
      const deduplicatedConditional = conditional.filter(q => {
        if (seenIds.has(q.id)) {
          return false;
        }
        seenIds.add(q.id);
        return true;
      });
      
      setProgramTypeQuestion(programType || null);
      setParqQuestions(parq);
      setInjuryQuestions(injury);
      setConditionalQuestions(deduplicatedConditional);
      
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
    
    // 2. PAR-Q+ questions (after program_type) - always shown
    ordered.push(...parqQuestions);
    
    // 3. Injury questions (after PAR-Q+) - always shown
    ordered.push(...injuryQuestions);
    
    // 4. Conditional questions based on program_type - DIFFERENT SETS DEPENDING ON QUESTION 1
    const programType = responses.program_type;
    if (programType) {
      // Filter conditional questions based on program_type
      // Each program type has completely different questions
      const filteredConditional = conditionalQuestions.filter(q => {
        // Strength training questions (8 questions)
        if (programType === 'strength_training') {
          return ['weekly_frequency', 'experience_level', 'equipment_available', 'goals', 
                  'plan_duration_weeks', 'training_split_preference', 'previous_injuries', 
                  'time_per_session'].includes(q.id);
        }
        // Mobility & stability questions (6 questions) - NO experience_level, NO goals
        else if (programType === 'mobility_stability') {
          return ['weekly_frequency', 'movement_confidence', 'stiffness_areas', 
                  'balance_difficulty', 'plan_duration_weeks', 'time_per_session'].includes(q.id);
        }
        // Recovery focused questions (6 questions) - NO experience_level, NO goals
        else if (programType === 'recovery_focused') {
          return ['weekly_frequency', 'pain_location', 'movement_limitations', 
                  'comfort_level', 'plan_duration_weeks', 'time_per_session'].includes(q.id);
        }
        return false;
      });
      ordered.push(...filteredConditional);
    }
    // If no program_type selected yet, don't show conditional questions
    
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
    
    if (currentStep < orderedQuestions.length) {
      // Moving to next question
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === orderedQuestions.length) {
      // Moving to detail level (last step before review)
      // Detail level is handled separately, so we skip to review
      setShowReview(true);
      setHasReachedReview(true);
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
      setCurrentStep(orderedQuestions.length); // Go back to detail level
    } else if (currentStep === orderedQuestions.length) {
      // From detail level, go back to last question
      setCurrentStep(orderedQuestions.length - 1);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canGoNext = () => {
    const orderedQuestions = getOrderedQuestions();
    
    // Detail level is at the end (after all questions)
    if (currentStep === orderedQuestions.length) {
      return detailLevel !== '';
    }
    
    if (currentStep >= 0 && currentStep < orderedQuestions.length) {
      const question = orderedQuestions[currentStep];
      const answer = responses[question?.id];
      return validateAnswer(question, answer);
    }
    
    return false;
  };

  const canGoPrevious = () => {
    if (showReview) return true;
    const orderedQuestions = getOrderedQuestions();
    return currentStep > 0 || currentStep === orderedQuestions.length; // Can go back from detail level
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
    if (currentStep < 0 || currentStep >= orderedQuestions.length) return null;
    return orderedQuestions[currentStep];
  };

  const getProgress = () => {
    if (showReview) return 100;
    const orderedQuestions = getOrderedQuestions();
    const totalSteps = orderedQuestions.length + 1; // +1 for detail level
    const currentProgress = currentStep === orderedQuestions.length 
      ? orderedQuestions.length + 1  // Detail level
      : currentStep + 1;
    return (currentProgress / totalSteps) * 100;
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
              : currentStep === orderedQuestions.length
                ? `Step ${orderedQuestions.length + 1} of ${totalSteps} (Detail Level)`
                : `Step ${currentStep + 1} of ${totalSteps}`
            }
          </div>
        </div>

        {/* Question Steps */}
        {!showReview && (
          <div className="question-step-container">
            {currentStep === orderedQuestions.length && renderDetailLevelSelection()}
            {currentStep < orderedQuestions.length && currentQuestion && (
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
                {currentStep === orderedQuestions.length ? 'Review →' : 'Next →'}
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
