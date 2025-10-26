/**
 * Application Configuration
 * Centralized configuration management
 */

import { APP_CONFIG, LLM_CONFIG, AUDIO_CONFIG, TENSORFLOW_CONFIG, POSE_DETECTION_CONFIG, CAMERA_CONFIG, FEEDBACK_INTERVALS } from '../shared/constants/AppConstants.js';

export const config = {
  // App Information
  app: {
    ...APP_CONFIG,
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.NODE_ENV === 'development'
  },

  // LLM Configuration
  llm: {
    ...LLM_CONFIG,
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.LLM_MODEL || LLM_CONFIG.DEFAULT_MODEL,
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS) || LLM_CONFIG.DEFAULT_MAX_TOKENS,
    temperature: parseFloat(process.env.LLM_TEMPERATURE) || LLM_CONFIG.DEFAULT_TEMPERATURE
  },

  // Audio Configuration
  audio: {
    ...AUDIO_CONFIG,
    volume: parseFloat(process.env.AUDIO_VOLUME) || AUDIO_CONFIG.DEFAULT_VOLUME,
    rate: parseFloat(process.env.AUDIO_RATE) || AUDIO_CONFIG.DEFAULT_RATE,
    pitch: parseFloat(process.env.AUDIO_PITCH) || AUDIO_CONFIG.DEFAULT_PITCH
  },

  // TensorFlow Configuration
  tensorflow: {
    ...TENSORFLOW_CONFIG,
    initTimeout: parseInt(process.env.TF_INIT_TIMEOUT) || TENSORFLOW_CONFIG.INIT_TIMEOUT_MS
  },

  // Pose Detection Configuration
  poseDetection: {
    ...POSE_DETECTION_CONFIG,
    minConfidence: parseFloat(process.env.POSE_MIN_CONFIDENCE) || POSE_DETECTION_CONFIG.MIN_CONFIDENCE
  },

  // Camera Configuration
  camera: {
    ...CAMERA_CONFIG,
    resolution: {
      width: parseInt(process.env.CAMERA_WIDTH) || CAMERA_CONFIG.DEFAULT_RESOLUTION.width,
      height: parseInt(process.env.CAMERA_HEIGHT) || CAMERA_CONFIG.DEFAULT_RESOLUTION.height
    }
  },

  // Feedback Configuration
  feedback: {
    ...FEEDBACK_INTERVALS,
    immediateMs: parseInt(process.env.IMMEDIATE_FEEDBACK_MS) || FEEDBACK_INTERVALS.IMMEDIATE_MS,
    aiFeedbackMs: parseInt(process.env.AI_FEEDBACK_MS) || FEEDBACK_INTERVALS.AI_FEEDBACK_MS,
    aggregatedAnalysisMs: parseInt(process.env.AGGREGATED_ANALYSIS_MS) || FEEDBACK_INTERVALS.AGGREGATED_ANALYSIS_MS
  },

  // Development Configuration
  development: {
    enableLogging: process.env.ENABLE_LOGGING === 'true' || process.env.NODE_ENV === 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    enableDebugOverlay: process.env.ENABLE_DEBUG_OVERLAY === 'true' || process.env.NODE_ENV === 'development'
  }
};

// Validate configuration
export const validateConfig = () => {
  const errors = [];

  // Validate LLM configuration
  if (!config.llm.apiKey) {
    errors.push('LLM API key is required');
  }

  // Validate audio configuration
  if (config.audio.volume < 0 || config.audio.volume > 1) {
    errors.push('Audio volume must be between 0 and 1');
  }

  if (config.audio.rate <= 0 || config.audio.rate > 3) {
    errors.push('Audio rate must be between 0 and 3');
  }

  if (config.audio.pitch < 0 || config.audio.pitch > 2) {
    errors.push('Audio pitch must be between 0 and 2');
  }

  // Validate camera configuration
  if (config.camera.resolution.width <= 0 || config.camera.resolution.height <= 0) {
    errors.push('Camera resolution must have positive dimensions');
  }

  // Validate feedback intervals
  if (config.feedback.immediateMs <= 0) {
    errors.push('Immediate feedback interval must be positive');
  }

  if (config.feedback.aiFeedbackMs <= 0) {
    errors.push('AI feedback interval must be positive');
  }

  if (config.feedback.aggregatedAnalysisMs <= 0) {
    errors.push('Aggregated analysis interval must be positive');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get configuration for specific module
export const getModuleConfig = (moduleName) => {
  switch (moduleName) {
    case 'llm':
      return config.llm;
    case 'audio':
      return config.audio;
    case 'tensorflow':
      return config.tensorflow;
    case 'poseDetection':
      return config.poseDetection;
    case 'camera':
      return config.camera;
    case 'feedback':
      return config.feedback;
    default:
      return config;
  }
};

// Update configuration at runtime
export const updateConfig = (moduleName, newConfig) => {
  if (config[moduleName]) {
    config[moduleName] = { ...config[moduleName], ...newConfig };
    return true;
  }
  return false;
};

export default config;
