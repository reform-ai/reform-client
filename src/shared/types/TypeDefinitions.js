/**
 * Type Definitions for Basketball Form Analyzer
 * Centralized type definitions and interfaces
 */

/**
 * @typedef {Object} Keypoint
 * @property {string} name - Name of the keypoint (e.g., 'right_shoulder')
 * @property {number} x - X coordinate (0-1 normalized)
 * @property {number} y - Y coordinate (0-1 normalized)
 * @property {number} confidence - Confidence score (0-1)
 */

/**
 * @typedef {Object} PoseData
 * @property {Keypoint[]} keypoints - Array of detected keypoints
 * @property {number} timestamp - Timestamp of the pose detection
 * @property {number} [shootingPhase] - Current shooting phase (0-1)
 * @property {number} [armAngle] - Arm angle in degrees
 * @property {number} [elbowAngle] - Elbow angle in degrees
 * @property {Object} [summary] - Summary of pose data
 * @property {number} summary.highConfidenceKeypoints - Number of high confidence keypoints
 * @property {number} summary.totalKeypoints - Total number of keypoints
 * @property {number} [summary.shootingPhase] - Shooting phase
 * @property {number} [summary.armAngle] - Arm angle
 * @property {number} [summary.elbowAngle] - Elbow angle
 */

/**
 * @typedef {Object} MovementData
 * @property {number} intensity - Movement intensity (0-5)
 * @property {string} direction - Movement direction
 * @property {number} timestamp - Timestamp of the movement
 * @property {boolean} [isUserInFrame] - Whether user is visible in frame
 * @property {string} [movementType] - Type of movement detected
 */

/**
 * @typedef {Object} ShootingTechniqueAnalysis
 * @property {number} techniqueScore - Overall technique score (0-100)
 * @property {string} armPosition - Arm position assessment
 * @property {string} elbowAngle - Elbow angle assessment
 * @property {string} shootingHand - Shooting hand positioning
 * @property {string} followThrough - Follow-through quality
 * @property {string[]} feedback - Array of feedback messages
 * @property {string[]} criticalIssues - Array of critical issues
 * @property {string[]} recommendations - Array of recommendations
 */

/**
 * @typedef {Object} LLMConfig
 * @property {string} apiKey - OpenAI API key
 * @property {string} model - Model name (e.g., 'gpt-3.5-turbo')
 * @property {number} [maxTokens] - Maximum tokens to generate
 * @property {number} [temperature] - Temperature for generation (0-2)
 * @property {number} [topP] - Top-p sampling parameter
 * @property {number} [frequencyPenalty] - Frequency penalty
 * @property {number} [presencePenalty] - Presence penalty
 * @property {number} [timeout] - Request timeout in milliseconds
 * @property {number} [maxRetries] - Maximum number of retries
 */

/**
 * @typedef {Object} AudioConfig
 * @property {number} volume - Audio volume (0-1)
 * @property {number} rate - Speech rate (0-3)
 * @property {number} pitch - Speech pitch (0-2)
 * @property {number} minSpeakIntervalMs - Minimum interval between audio feedback
 * @property {number} maxFeedbackLength - Maximum length of feedback text
 */

/**
 * @typedef {Object} CameraDimensions
 * @property {number} width - Camera width in pixels
 * @property {number} height - Camera height in pixels
 */

/**
 * @typedef {Object} AggregatedData
 * @property {PoseData[]} poseHistory - Array of pose data over time
 * @property {MovementData[]} movementHistory - Array of movement data over time
 * @property {number} startTime - Start time of aggregation period
 * @property {number} endTime - End time of aggregation period
 * @property {number} totalShots - Total number of shots detected
 * @property {number} averageIntensity - Average movement intensity
 * @property {ShootingTechniqueAnalysis} [lastAnalysis] - Last technique analysis
 */

/**
 * @typedef {Object} BasketballFormData
 * @property {PoseData} poseData - Current pose data
 * @property {MovementData} movementData - Current movement data
 * @property {AggregatedData} aggregatedData - Aggregated data over time
 * @property {ShootingTechniqueAnalysis} [techniqueAnalysis] - Current technique analysis
 * @property {string} [currentTip] - Current feedback tip
 * @property {number} [formScore] - Overall form score
 * @property {number} [techniqueScore] - Technique-specific score
 */

/**
 * @typedef {Object} LLMResponse
 * @property {string} content - Generated content
 * @property {string} [role] - Role of the response
 * @property {number} [usage] - Token usage information
 * @property {string} [finishReason] - Reason for completion
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {Object} error - Error details
 * @property {string} error.code - Error code
 * @property {string} error.message - Error message
 * @property {string} [error.field] - Field that caused the error
 * @property {string} error.timestamp - Error timestamp
 */

/**
 * @typedef {Object} SuccessResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {*} data - Response data
 * @property {string} [message] - Success message
 * @property {string} timestamp - Response timestamp
 */

/**
 * @typedef {Object} UserPreferences
 * @property {AudioConfig} audio - Audio preferences
 * @property {LLMConfig} llm - LLM preferences
 * @property {Object} analysis - Analysis preferences
 * @property {boolean} analysis.enablePoseOverlay - Whether to show pose overlay
 * @property {boolean} analysis.enableAudioFeedback - Whether to enable audio feedback
 * @property {boolean} analysis.enableLLMFeedback - Whether to enable LLM feedback
 * @property {number} analysis.feedbackInterval - Feedback interval in milliseconds
 */

/**
 * @typedef {Object} AppState
 * @property {boolean} isAnalyzing - Whether analysis is active
 * @property {boolean} tensorFlowReady - Whether TensorFlow is ready
 * @property {boolean} cameraReady - Whether camera is ready
 * @property {boolean} isUserInFrame - Whether user is visible in frame
 * @property {string} currentMovement - Current movement type
 * @property {number} movementIntensity - Current movement intensity
 * @property {string} currentTip - Current feedback tip
 * @property {number} techniqueScore - Current technique score
 * @property {ShootingTechniqueAnalysis} [techniqueAnalysis] - Current technique analysis
 * @property {CameraDimensions} [cameraDimensions] - Camera dimensions
 * @property {PoseData} [poseData] - Current pose data
 * @property {MovementData} [movementData] - Current movement data
 */

/**
 * @typedef {Object} ConnectionLine
 * @property {string} from - Source keypoint name
 * @property {string} to - Target keypoint name
 * @property {string} [color] - Line color
 * @property {number} [thickness] - Line thickness
 */

/**
 * @typedef {Object} JointStyle
 * @property {string} color - Joint color
 * @property {number} size - Joint size
 * @property {string} [borderColor] - Border color
 * @property {number} [borderWidth] - Border width
 */

/**
 * @typedef {Object} PhaseIndicator
 * @property {string} phase - Current shooting phase
 * @property {string} color - Phase color
 * @property {number} [armAngle] - Current arm angle
 * @property {number} [elbowAngle] - Current elbow angle
 */

// Export type definitions for use in other modules
export const TYPES = {
  Keypoint: 'Keypoint',
  PoseData: 'PoseData',
  MovementData: 'MovementData',
  ShootingTechniqueAnalysis: 'ShootingTechniqueAnalysis',
  LLMConfig: 'LLMConfig',
  AudioConfig: 'AudioConfig',
  CameraDimensions: 'CameraDimensions',
  AggregatedData: 'AggregatedData',
  BasketballFormData: 'BasketballFormData',
  LLMResponse: 'LLMResponse',
  ErrorResponse: 'ErrorResponse',
  SuccessResponse: 'SuccessResponse',
  UserPreferences: 'UserPreferences',
  AppState: 'AppState',
  ConnectionLine: 'ConnectionLine',
  JointStyle: 'JointStyle',
  PhaseIndicator: 'PhaseIndicator'
};
