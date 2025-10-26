/**
 * Application Constants for Basketball Form Analyzer
 * Centralized configuration and constant values
 */

export const APP_CONFIG = {
  NAME: 'Basketball Form Analyzer',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered basketball shooting form analysis',
  AUTHOR: 'Narayan Manivannan'
};

export const MOVEMENT_THRESHOLDS = {
  IDLE: 0.5,
  LOW: 1.0,
  MODERATE: 1.5,
  HIGH: 2.0,
  VERY_HIGH: 2.5,
  EXTREME: 3.0
};

export const POSE_CONFIDENCE_THRESHOLDS = {
  LOW: 0.3,
  MEDIUM: 0.5,
  HIGH: 0.8,
  VERY_HIGH: 0.9
};

export const SHOOTING_PHASES = {
  SETUP: 'setup',
  PREPARATION: 'preparation',
  RELEASE: 'release',
  FOLLOW_THROUGH: 'follow_through',
  LANDING: 'landing',
  RECOVERY: 'recovery'
};

export const SHOOTING_PHASE_THRESHOLDS = {
  SETUP: 0.1,
  PREPARATION: 0.3,
  RELEASE: 0.6,
  FOLLOW_THROUGH: 0.8,
  LANDING: 0.9,
  RECOVERY: 1.0
};

export const TECHNIQUE_SCORES = {
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 60,
  POOR: 40,
  VERY_POOR: 20
};

export const ARM_POSITIONS = {
  HIGH_POWER: 'high_power',
  GOOD_POWER: 'good_power',
  MODERATE_POWER: 'moderate_power',
  LOW_POWER: 'low_power',
  VERY_LOW_POWER: 'very_low_power'
};

export const ELBOW_ANGLES = {
  GOOD_ANGLE: 'good_angle',
  NEEDS_IMPROVEMENT: 'needs_improvement',
  POOR_ANGLE: 'poor_angle'
};

export const SHOOTING_HAND_POSITIONS = {
  GOOD_POSITION: 'good_position',
  NEEDS_WORK: 'needs_work'
};

export const FOLLOW_THROUGH_QUALITY = {
  GOOD: 'good',
  NEEDS_IMPROVEMENT: 'needs_improvement'
};

export const AUDIO_CONFIG = {
  DEFAULT_VOLUME: 0.8,
  DEFAULT_RATE: 1.0,
  DEFAULT_PITCH: 1.0,
  MIN_SPEAK_INTERVAL_MS: 5000,
  MAX_FEEDBACK_LENGTH: 200
};

export const LLM_CONFIG = {
  DEFAULT_MODEL: 'gpt-3.5-turbo',
  DEFAULT_MAX_TOKENS: 150,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_TOP_P: 1.0,
  DEFAULT_FREQUENCY_PENALTY: 0.0,
  DEFAULT_PRESENCE_PENALTY: 0.0,
  REQUEST_TIMEOUT_MS: 30000,
  MAX_RETRIES: 3
};

export const TENSORFLOW_CONFIG = {
  PREFERRED_BACKEND: 'rn-webgl',
  FALLBACK_BACKEND: 'cpu',
  INIT_TIMEOUT_MS: 10000
};

export const POSE_DETECTION_CONFIG = {
  MIN_CONFIDENCE: 0.3,
  MAX_DETECTIONS: 1,
  NMS_THRESHOLD: 0.3,
  SCORE_THRESHOLD: 0.3
};

export const CAMERA_CONFIG = {
  DEFAULT_RESOLUTION: { width: 640, height: 480 },
  PREFERRED_FPS: 30,
  MAX_FPS: 60,
  MIN_FPS: 15
};

export const FEEDBACK_INTERVALS = {
  IMMEDIATE_MS: 1000,
  AI_FEEDBACK_MS: 5000,
  AGGREGATED_ANALYSIS_MS: 30000
};

export const KEYPOINT_NAMES = {
  NOSE: 'nose',
  LEFT_EYE: 'left_eye',
  RIGHT_EYE: 'right_eye',
  LEFT_EAR: 'left_ear',
  RIGHT_EAR: 'right_ear',
  LEFT_SHOULDER: 'left_shoulder',
  RIGHT_SHOULDER: 'right_shoulder',
  LEFT_ELBOW: 'left_elbow',
  RIGHT_ELBOW: 'right_elbow',
  LEFT_WRIST: 'left_wrist',
  RIGHT_WRIST: 'right_wrist',
  LEFT_HIP: 'left_hip',
  RIGHT_HIP: 'right_hip',
  LEFT_KNEE: 'left_knee',
  RIGHT_KNEE: 'right_knee',
  LEFT_ANKLE: 'left_ankle',
  RIGHT_ANKLE: 'right_ankle'
};

export const SHOOTING_ARM_JOINTS = [
  KEYPOINT_NAMES.RIGHT_SHOULDER,
  KEYPOINT_NAMES.RIGHT_ELBOW,
  KEYPOINT_NAMES.RIGHT_WRIST
];

export const SUPPORT_ARM_JOINTS = [
  KEYPOINT_NAMES.LEFT_SHOULDER,
  KEYPOINT_NAMES.LEFT_ELBOW,
  KEYPOINT_NAMES.LEFT_WRIST
];

export const IMPORTANT_JOINTS = [
  ...SHOOTING_ARM_JOINTS,
  ...SUPPORT_ARM_JOINTS,
  KEYPOINT_NAMES.NOSE,
  KEYPOINT_NAMES.LEFT_EYE,
  KEYPOINT_NAMES.RIGHT_EYE
];

export const CONNECTION_LINES = [
  { from: KEYPOINT_NAMES.RIGHT_SHOULDER, to: KEYPOINT_NAMES.RIGHT_ELBOW },
  { from: KEYPOINT_NAMES.RIGHT_ELBOW, to: KEYPOINT_NAMES.RIGHT_WRIST },
  { from: KEYPOINT_NAMES.LEFT_SHOULDER, to: KEYPOINT_NAMES.LEFT_ELBOW },
  { from: KEYPOINT_NAMES.LEFT_ELBOW, to: KEYPOINT_NAMES.LEFT_WRIST }
];

export const COLORS = {
  PRIMARY: '#FF6B35',
  SECONDARY: '#4ECDC4',
  SUCCESS: '#00FF00',
  WARNING: '#FFFF00',
  ERROR: '#FF0000',
  INFO: '#00BFFF',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#6B7280',
  LIGHT_GRAY: '#F3F4F6',
  DARK_GRAY: '#374151'
};

export const CONFIDENCE_COLORS = {
  HIGH: COLORS.SUCCESS,
  MEDIUM: COLORS.WARNING,
  LOW: COLORS.ERROR
};

export const PHASE_COLORS = {
  [SHOOTING_PHASES.SETUP]: COLORS.PRIMARY,
  [SHOOTING_PHASES.PREPARATION]: COLORS.PRIMARY,
  [SHOOTING_PHASES.RELEASE]: COLORS.WARNING,
  [SHOOTING_PHASES.FOLLOW_THROUGH]: COLORS.SUCCESS,
  [SHOOTING_PHASES.LANDING]: COLORS.GRAY,
  [SHOOTING_PHASES.RECOVERY]: COLORS.GRAY
};

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

export const SUCCESS_MESSAGES = {
  TENSORFLOW_INIT_SUCCESS: 'TensorFlow.js initialized successfully',
  POSE_DETECTION_SUCCESS: 'Pose detection working correctly',
  LLM_FEEDBACK_SUCCESS: 'LLM feedback generated successfully',
  AUDIO_PLAYBACK_SUCCESS: 'Audio feedback played successfully',
  CAMERA_READY: 'Camera is ready for analysis'
};

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  VERBOSE: 'verbose'
};

export const API_ENDPOINTS = {
  HEALTH_CHECK: '/health',
  POSE_ANALYSIS: '/pose/analyze',
  MOVEMENT_ANALYSIS: '/movement/analyze',
  SHOOTING_TECHNIQUE: '/shooting/technique',
  LLM_FEEDBACK: '/llm/feedback',
  AUDIO_FEEDBACK: '/audio/feedback'
};

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  ANALYSIS_HISTORY: 'analysis_history',
  SETTINGS: 'app_settings',
  CACHE: 'app_cache'
};
