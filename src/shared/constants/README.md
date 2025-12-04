# Constants Documentation

This directory contains centralized constants for the Reform Client application. Use these constants instead of hardcoding values throughout the codebase.

## Structure

```
constants/
├── app.js          # App-wide constants (pagination, scores, file sizes, etc.)
├── upload.js       # Upload constants (deprecated - use app.js)
├── index.js        # Central export point
└── README.md       # This file
```

## Usage

### Importing Constants

```javascript
// Import specific constants
import { PAGINATION, SCORE_THRESHOLDS } from '../shared/constants/app';

// Or import from index (recommended)
import { PAGINATION, SCORE_THRESHOLDS, FILE_SIZES } from '../shared/constants';
```

### Available Constants

#### PAGINATION

Constants for pagination and list limits:

```javascript
PAGINATION.DEFAULT_LIMIT    // 20 - Default items per page
PAGINATION.DEFAULT_OFFSET   // 0 - Default starting position
PAGINATION.MAX_LIMIT        // 100 - Maximum allowed limit
PAGINATION.MIN_LIMIT        // 1 - Minimum allowed limit
```

**Example:**
```javascript
import { PAGINATION } from '../shared/constants';

const [limit] = useState(PAGINATION.DEFAULT_LIMIT);
const [offset, setOffset] = useState(PAGINATION.DEFAULT_OFFSET);
```

#### SCORE_THRESHOLDS

Constants for score categorization:

```javascript
SCORE_THRESHOLDS.EXCELLENT  // 90 - Minimum for "Excellent"
SCORE_THRESHOLDS.GOOD       // 75 - Minimum for "Good"
SCORE_THRESHOLDS.WARNING    // 60 - Minimum for "Warning"
SCORE_THRESHOLDS.POOR       // 0 - Minimum for "Poor"
SCORE_THRESHOLDS.MAX        // 100 - Maximum possible score
SCORE_THRESHOLDS.MIN        // 0 - Minimum possible score
```

**Example:**
```javascript
import { SCORE_THRESHOLDS } from '../shared/constants';

if (score >= SCORE_THRESHOLDS.EXCELLENT) {
  return 'var(--score-excellent)';
}
```

#### FILE_SIZES

Constants for file size limits:

```javascript
FILE_SIZES.MAX_VIDEO_BYTES        // 500 * 1024 * 1024 (500 MB)
FILE_SIZES.VIDEO_WARNING_BYTES    // 50 * 1024 * 1024 (50 MB)
FILE_SIZES.MAX_IMAGE_BYTES        // 10 * 1024 * 1024 (10 MB)
FILE_SIZES.MAX_IMAGES             // 5 - Maximum images per upload
```

**Example:**
```javascript
import { FILE_SIZES } from '../shared/constants';

if (file.size > FILE_SIZES.MAX_VIDEO_BYTES) {
  setError('File too large');
}
```

#### VIDEO_DEFAULTS

Constants for video metadata defaults:

```javascript
VIDEO_DEFAULTS.DEFAULT_FPS  // 30 - Default FPS if not detected
VIDEO_DEFAULTS.MIN_FPS       // 1 - Minimum valid FPS
VIDEO_DEFAULTS.MAX_FPS       // 120 - Maximum valid FPS
```

**Example:**
```javascript
import { VIDEO_DEFAULTS } from '../shared/constants';

const fps = detectedFps || VIDEO_DEFAULTS.DEFAULT_FPS;
```

#### TIMEOUTS

Constants for operation timeouts (in milliseconds):

```javascript
TIMEOUTS.API_REQUEST  // 30000 (30 seconds)
TIMEOUTS.UPLOAD       // 300000 (5 minutes)
TIMEOUTS.SHORT        // 5000 (5 seconds)
TIMEOUTS.MEDIUM       // 15000 (15 seconds)
```

#### RETRY

Constants for retry logic:

```javascript
RETRY.MAX_ATTEMPTS        // 3 - Maximum retry attempts
RETRY.DELAY_MS           // 1000 - Delay between retries (ms)
RETRY.BACKOFF_MULTIPLIER // 2 - Exponential backoff multiplier
```

#### DATE_TIME

Constants for date/time calculations:

```javascript
DATE_TIME.MS_PER_DAY              // 24 * 60 * 60 * 1000
DATE_TIME.MS_PER_HOUR             // 60 * 60 * 1000
DATE_TIME.MS_PER_MINUTE           // 60 * 1000
DATE_TIME.JUST_NOW_THRESHOLD_MS   // 60 * 1000 (1 minute)
DATE_TIME.MINUTES_AGO_THRESHOLD_MS // 30 * 60 * 1000 (30 minutes)
```

#### VALIDATION

Constants for input validation:

```javascript
VALIDATION.USERNAME_MIN_LENGTH  // 3
VALIDATION.USERNAME_MAX_LENGTH  // 30
VALIDATION.PASSWORD_MIN_LENGTH  // 8
VALIDATION.PASSWORD_MAX_LENGTH  // 128
VALIDATION.EMAIL_MIN_LENGTH     // 5
VALIDATION.EMAIL_MAX_LENGTH     // 254
```

#### EXERCISE_TYPES

Constants for exercise type IDs:

```javascript
EXERCISE_TYPES.SQUAT     // 1
EXERCISE_TYPES.BENCH     // 2
EXERCISE_TYPES.DEADLIFT  // 3
```

#### ALLOWED_FILE_TYPES

Constants for allowed file types:

```javascript
ALLOWED_FILE_TYPES.IMAGES         // Array of image MIME types
ALLOWED_FILE_TYPES.VIDEOS         // Array of video MIME types
ALLOWED_FILE_TYPES.VIDEO_EXTENSIONS // Array of video file extensions
```

## Migration from Hardcoded Values

### Before (Hardcoded)
```javascript
const [limit] = useState(20);
const [offset, setOffset] = useState(0);

if (score >= 90) return 'excellent';
if (file.size > 500 * 1024 * 1024) setError('Too large');
```

### After (Using Constants)
```javascript
import { PAGINATION, SCORE_THRESHOLDS, FILE_SIZES } from '../shared/constants';

const [limit] = useState(PAGINATION.DEFAULT_LIMIT);
const [offset, setOffset] = useState(PAGINATION.DEFAULT_OFFSET);

if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'excellent';
if (file.size > FILE_SIZES.MAX_VIDEO_BYTES) setError('Too large');
```

## Best Practices

1. **Always use constants** instead of hardcoding values
2. **Import from index** for cleaner imports: `import { PAGINATION } from '../shared/constants'`
3. **Check existing constants** before adding new hardcoded values
4. **Update constants** when business requirements change
5. **Document new constants** with JSDoc comments

## Adding New Constants

When adding new constants:

1. Add to the appropriate section in `app.js`
2. Use descriptive names in UPPER_SNAKE_CASE
3. Add JSDoc comments explaining the constant
4. Update this README with the new constant
5. Update any related code to use the new constant

**Example:**
```javascript
/**
 * New feature constants
 */
export const NEW_FEATURE = {
  /** Maximum items allowed */
  MAX_ITEMS: 100,
  
  /** Default timeout in milliseconds */
  TIMEOUT_MS: 5000,
};
```

## Deprecated Constants

Some constants have been moved to `app.js` for better organization:

- `UPLOAD_CONSTANTS` (in `upload.js`) - Use `FILE_SIZES` and `ALLOWED_FILE_TYPES` from `app.js` instead
- `MAX_FILE_SIZE_BYTES` (in `fileValidation.js`) - Use `FILE_SIZES.MAX_VIDEO_BYTES` instead
- `WARNING_SIZE_BYTES` (in `fileValidation.js`) - Use `FILE_SIZES.VIDEO_WARNING_BYTES` instead

These are kept for backward compatibility but will be removed in a future version.

