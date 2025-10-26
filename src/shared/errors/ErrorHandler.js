/**
 * Centralized Error Handling for Basketball Form Analyzer
 * Handles all types of errors with proper logging and user feedback
 */

export class AppError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends AppError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
  }
}

export class TensorFlowError extends AppError {
  constructor(message) {
    super(message, 'TENSORFLOW_ERROR', 500);
  }
}

export class LLMError extends AppError {
  constructor(message) {
    super(message, 'LLM_ERROR', 500);
  }
}

export class PoseDetectionError extends AppError {
  constructor(message) {
    super(message, 'POSE_DETECTION_ERROR', 500);
  }
}

export class AudioError extends AppError {
  constructor(message) {
    super(message, 'AUDIO_ERROR', 500);
  }
}

// Error handler for async functions
export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler
export const globalErrorHandler = (error, req, res, next) => {
  console.error('🚨 [ERROR]', error);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  }

  // Log error details
  console.error(`Error ${code}: ${message}`, {
    timestamp: error.timestamp || new Date().toISOString(),
    stack: error.stack,
    ...(error.field && { field: error.field })
  });

  // Return error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(error.field && { field: error.field }),
      timestamp: error.timestamp || new Date().toISOString()
    }
  });
};

// Error types for different modules
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TENSORFLOW_ERROR: 'TENSORFLOW_ERROR',
  LLM_ERROR: 'LLM_ERROR',
  POSE_DETECTION_ERROR: 'POSE_DETECTION_ERROR',
  AUDIO_ERROR: 'AUDIO_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
};

// Error messages
export const ERROR_MESSAGES = {
  TENSORFLOW_INIT_FAILED: 'Failed to initialize TensorFlow.js',
  TENSORFLOW_BACKEND_ERROR: 'TensorFlow backend error',
  LLM_API_ERROR: 'LLM API request failed',
  LLM_RESPONSE_ERROR: 'Invalid LLM response',
  POSE_DETECTION_FAILED: 'Pose detection failed',
  AUDIO_PLAYBACK_ERROR: 'Audio playback failed',
  CAMERA_PERMISSION_DENIED: 'Camera permission denied',
  INVALID_POSE_DATA: 'Invalid pose data received',
  INVALID_MOVEMENT_DATA: 'Invalid movement data received',
  NETWORK_CONNECTION_ERROR: 'Network connection failed'
};
