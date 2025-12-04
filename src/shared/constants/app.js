/**
 * App-Wide Constants
 * 
 * Centralized constants for application-wide configuration values.
 * Use these constants instead of hardcoding values throughout the codebase.
 * 
 * @module appConstants
 */

/**
 * Pagination constants
 * Used for API requests and list pagination
 */
export const PAGINATION = {
  /** Default number of items per page */
  DEFAULT_LIMIT: 20,
  
  /** Default offset (starting position) */
  DEFAULT_OFFSET: 0,
  
  /** Maximum allowed limit per request */
  MAX_LIMIT: 100,
  
  /** Minimum allowed limit per request */
  MIN_LIMIT: 1,
};

/**
 * Score threshold constants
 * Used for determining score color categories and validation
 */
export const SCORE_THRESHOLDS = {
  /** Minimum score for "Excellent" category (90-100) */
  EXCELLENT: 90,
  
  /** Minimum score for "Good" category (75-89) */
  GOOD: 75,
  
  /** Minimum score for "Warning" category (60-74) */
  WARNING: 60,
  
  /** Minimum score (0-59 is "Poor") */
  POOR: 0,
  
  /** Maximum possible score */
  MAX: 100,
  
  /** Minimum possible score */
  MIN: 0,
};

/**
 * File size constants
 * Used for file validation and upload limits
 */
export const FILE_SIZES = {
  /** Maximum video file size in bytes (500 MB) */
  MAX_VIDEO_BYTES: 500 * 1024 * 1024,
  
  /** Video file size threshold for warnings (50 MB) */
  VIDEO_WARNING_BYTES: 50 * 1024 * 1024,
  
  /** Maximum image file size in bytes (10 MB) */
  MAX_IMAGE_BYTES: 10 * 1024 * 1024,
  
  /** Maximum number of images allowed per upload */
  MAX_IMAGES: 5,
};

/**
 * Video metadata constants
 * Default values for video processing
 */
export const VIDEO_DEFAULTS = {
  /** Default frames per second if not detected */
  DEFAULT_FPS: 30,
  
  /** Minimum valid FPS */
  MIN_FPS: 1,
  
  /** Maximum valid FPS */
  MAX_FPS: 120,
};

/**
 * Timeout constants (in milliseconds)
 * Used for API requests and operations
 */
export const TIMEOUTS = {
  /** Default API request timeout */
  API_REQUEST: 30000, // 30 seconds
  
  /** Upload timeout (for large files) */
  UPLOAD: 300000, // 5 minutes
  
  /** Short operation timeout */
  SHORT: 5000, // 5 seconds
  
  /** Medium operation timeout */
  MEDIUM: 15000, // 15 seconds
};

/**
 * Retry constants
 * Used for retry logic in API calls
 */
export const RETRY = {
  /** Maximum number of retry attempts */
  MAX_ATTEMPTS: 3,
  
  /** Delay between retries (in milliseconds) */
  DELAY_MS: 1000,
  
  /** Exponential backoff multiplier */
  BACKOFF_MULTIPLIER: 2,
};

/**
 * Date and time constants
 * Used for date formatting and validation
 */
export const DATE_TIME = {
  /** Number of milliseconds in a day */
  MS_PER_DAY: 24 * 60 * 60 * 1000,
  
  /** Number of milliseconds in an hour */
  MS_PER_HOUR: 60 * 60 * 1000,
  
  /** Number of milliseconds in a minute */
  MS_PER_MINUTE: 60 * 1000,
  
  /** Relative time threshold for "just now" (1 minute) */
  JUST_NOW_THRESHOLD_MS: 60 * 1000,
  
  /** Relative time threshold for "X min ago" (30 minutes) */
  MINUTES_AGO_THRESHOLD_MS: 30 * 60 * 1000,
};

/**
 * Validation constants
 * Used for input validation and limits
 */
export const VALIDATION = {
  /** Minimum username length */
  USERNAME_MIN_LENGTH: 3,
  
  /** Maximum username length */
  USERNAME_MAX_LENGTH: 30,
  
  /** Minimum password length */
  PASSWORD_MIN_LENGTH: 8,
  
  /** Maximum password length */
  PASSWORD_MAX_LENGTH: 128,
  
  /** Minimum email length */
  EMAIL_MIN_LENGTH: 5,
  
  /** Maximum email length */
  EMAIL_MAX_LENGTH: 254,
};

/**
 * Exercise type constants
 * Used for exercise identification
 */
export const EXERCISE_TYPES = {
  /** Squat exercise ID */
  SQUAT: 1,
  
  /** Bench press exercise ID */
  BENCH: 2,
  
  /** Deadlift exercise ID */
  DEADLIFT: 3,
};

/**
 * Allowed file types
 * Used for file validation
 */
export const ALLOWED_FILE_TYPES = {
  /** Allowed image MIME types */
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  
  /** Allowed video MIME types */
  VIDEOS: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
  
  /** Allowed video file extensions */
  VIDEO_EXTENSIONS: ['.mp4', '.mov', '.avi'],
};

