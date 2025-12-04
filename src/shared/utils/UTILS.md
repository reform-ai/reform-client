# Shared Utilities Catalog

This document provides a quick reference guide to all utility functions in the `src/shared/utils/` directory.

## Table of Contents

- [Authentication & Authorization](#authentication--authorization)
- [API & Network](#api--network)
- [Date & Time Formatting](#date--time-formatting)
- [Error Handling](#error-handling)
- [File & Video Utilities](#file--video-utilities)
- [Analysis Utilities](#analysis-utilities)
- [Token Management](#token-management)
- [Validation](#validation)
- [Chart & Plot Utilities](#chart--plot-utilities)
- [Score Utilities](#score-utilities)

---

## Authentication & Authorization

### authStorage.js

**Location:** `shared/utils/authStorage.js`

#### `storeUserData(data)`

Stores user authentication data in localStorage after login/signup.

**Parameters:**
- `data` (Object) - Response data from login/signup endpoint
  - `user_id` (string, required) - User ID
  - `email` (string, required) - User email
  - `full_name` (string, required) - User's full name
  - `access_token` (string, optional) - Access token (stored as fallback)

**Example:**
```javascript
import { storeUserData } from '../shared/utils/authStorage';

storeUserData({
  user_id: '123',
  email: 'user@example.com',
  full_name: 'John Doe',
  access_token: 'token123'
});
```

#### `clearUserData()`

Clears all authentication data from localStorage and httpOnly cookies.

**Returns:** `Promise<void>`

**Example:**
```javascript
import { clearUserData } from '../shared/utils/authStorage';

await clearUserData();
```

#### `isUserLoggedIn()`

Checks if user is currently logged in.

**Returns:** `boolean` - True if user is marked as logged in

**Example:**
```javascript
import { isUserLoggedIn } from '../shared/utils/authStorage';

if (isUserLoggedIn()) {
  // Show authenticated UI
}
```

#### `getUserToken()`

Gets the user's authentication token from localStorage (fallback for browsers that block cookies).

**Returns:** `string|null` - Access token or null if not available

**Example:**
```javascript
import { getUserToken } from '../shared/utils/authStorage';

const token = getUserToken();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### useRequireAuth.js

**Location:** `shared/utils/useRequireAuth.js`

#### `useRequireAuth(navigate, callback)`

Custom hook to require authentication for protected routes.

**Parameters:**
- `navigate` (Function, required) - React Router navigate function from `useNavigate()`
- `callback` (Function, optional) - Optional callback to execute if authenticated (use `useCallback()`)

**Returns:** `boolean` - Whether user is authenticated

**Example:**
```javascript
import { useRequireAuth } from '../shared/utils/useRequireAuth';

const navigate = useNavigate();
const isAuthenticated = useRequireAuth(navigate);
```

---

## API & Network

### authenticatedFetch.js

**Location:** `shared/utils/authenticatedFetch.js`

#### `authenticatedFetch(url, options, navigate, retryOn401)`

Makes an authenticated fetch request with automatic token handling and refresh.

**Parameters:**
- `url` (string, required) - The URL to fetch
- `options` (RequestInit, optional) - Fetch options (method, body, headers, etc.)
- `navigate` (Function, optional) - Optional navigate function for 401 redirects
- `retryOn401` (boolean, optional) - Whether to retry with refreshed token on 401 (default: true)

**Returns:** `Promise<Response>` - Fetch response

**Throws:** `Error` - If request fails or user is not authenticated

**Example:**
```javascript
import { authenticatedFetch } from '../shared/utils/authenticatedFetch';

const response = await authenticatedFetch(url, {
  method: 'POST',
  body: JSON.stringify(data)
}, navigate);
```

#### `authenticatedFetchJson(url, options, navigate)`

Makes an authenticated fetch request and parses JSON response.

**Parameters:**
- `url` (string, required) - The URL to fetch
- `options` (RequestInit, optional) - Fetch options
- `navigate` (Function, optional) - Optional navigate function for 401 redirects

**Returns:** `Promise<Object>` - Parsed JSON response

**Throws:** `Error` - If request fails or user is not authenticated

**Example:**
```javascript
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';

const data = await authenticatedFetchJson(url, {
  method: 'GET'
}, navigate);
```

### apiErrorHandler.js

**Location:** `shared/utils/apiErrorHandler.js`

#### `parseErrorResponse(response, responseText, status)`

Parses error response from FastAPI server.

**Parameters:**
- `response` (XMLHttpRequest|Response) - The XMLHttpRequest or Fetch Response object
- `responseText` (string, optional) - The response text (for XHR) or null (for Fetch)
- `status` (number, optional) - HTTP status code

**Returns:** `{errorMsg: string, errorData: object|null}` - Parsed error message and structured data

#### `handleFetchError(response)`

Handles Fetch API error responses.

**Parameters:**
- `response` (Response) - Fetch Response object

**Returns:** `Promise<Error>` - Error object with errorData property

**See also:** [Error Handling Guide](./ERROR_HANDLING.md)

---

## Date & Time Formatting

### dateFormat.js

**Location:** `shared/utils/dateFormat.js`

#### `parseUTCDate(dateValue)`

Parses a date value and converts UTC strings to proper Date objects.

**Parameters:**
- `dateValue` (string|Date) - Date to parse

**Returns:** `Date|null` - Parsed Date object, or null if invalid

**Example:**
```javascript
import { parseUTCDate } from '../shared/utils/dateFormat';

const date = parseUTCDate('2025-12-08T14:30:00');
```

#### `formatDate(dateValue)`

Format date for display in posts and comments (relative format).

**Parameters:**
- `dateValue` (string|Date) - Date to format

**Returns:** `string` - Formatted date string (empty string if invalid)
  - "just now" for < 1 min
  - "x min ago" for 1-30 min
  - Full date/time for > 30 min

**Example:**
```javascript
import { formatDate } from '../shared/utils/dateFormat';

const display = formatDate(post.created_at); // "5m ago" or "Dec 8, 2025, 2:30 PM"
```

#### `formatDateTime(dateValue, options)`

Format date and time for display (full format, not relative).

**Parameters:**
- `dateValue` (string|Date) - Date to format
- `options` (Object, optional) - Formatting options
  - `includeTime` (boolean, optional) - Whether to include time (default: true)

**Returns:** `string` - Formatted date string ("N/A" if invalid)

**Example:**
```javascript
import { formatDateTime } from '../shared/utils/dateFormat';

const display = formatDateTime(timestamp); // "Dec 8, 2025, 2:30 PM"
```

#### `formatDateOnly(dateValue)`

Format date only (no time) for display.

**Parameters:**
- `dateValue` (string|Date) - Date to format

**Returns:** `string` - Formatted date string ("Never" if invalid or null)

**Example:**
```javascript
import { formatDateOnly } from '../shared/utils/dateFormat';

const display = formatDateOnly(timestamp); // "Dec 8, 2025"
```

#### `formatTimeOnly(dateValue)`

Format time only (no date) for display.

**Parameters:**
- `dateValue` (string|Date) - Date to format

**Returns:** `string` - Formatted time string ("N/A" if invalid)

**Example:**
```javascript
import { formatTimeOnly } from '../shared/utils/dateFormat';

const display = formatTimeOnly(timestamp); // "2:30 PM"
```

---

## Error Handling

### errorHandling.js

**Location:** `shared/utils/errorHandling.js`

#### `handleApiError(error, options)`

Processes API errors and extracts user-friendly messages.

**Parameters:**
- `error` (Error) - Error object from API call
- `options` (Object, optional) - Error handling options
  - `defaultMessage` (string, optional) - Default message if error message cannot be extracted
  - `logToConsole` (boolean, optional) - Whether to log error to console (default: true)
  - `onError` (Function, optional) - Optional callback with error details

**Returns:** `{message: string, errorData: object|null}` - Object with message and errorData

**Example:**
```javascript
import { handleApiError } from '../shared/utils/errorHandling';

try {
  await apiCall();
} catch (error) {
  const { message, errorData } = handleApiError(error, {
    defaultMessage: 'Failed to load data'
  });
  setError(message);
}
```

#### `displayUserError(error, setError, options)`

Displays error message to user using appropriate method.

**Parameters:**
- `error` (Error|string) - Error object or error message string
- `setError` (Function) - State setter function for error state
- `options` (Object, optional) - Display options
  - `defaultMessage` (string, optional) - Default message if error message cannot be extracted
  - `useAlert` (boolean, optional) - Whether to use alert() (not recommended, default: false)

**Example:**
```javascript
import { displayUserError } from '../shared/utils/errorHandling';

try {
  await someOperation();
} catch (error) {
  displayUserError(error, setError, {
    defaultMessage: 'Operation failed'
  });
}
```

#### `handleValidationError(error, options)`

Handles form validation errors with field-specific messages.

**Parameters:**
- `error` (Error) - Error object from API call
- `options` (Object, optional) - Validation error handling options
  - `setFieldErrors` (Function, optional) - Function to set field-specific errors
  - `setGeneralError` (Function, optional) - Function to set general form error

**Returns:** `{fieldErrors: object, generalError: string|null}` - Object with fieldErrors and generalError

**See also:** [Error Handling Guide](./ERROR_HANDLING.md)

---

## File & Video Utilities

### fileValidation.js

**Location:** `shared/utils/fileValidation.js`

#### `validateFile(file)`

Validates a video file before upload.

**Parameters:**
- `file` (File) - File object to validate

**Returns:** `{valid: boolean, error?: string}` - Validation result

**Example:**
```javascript
import { validateFile } from '../shared/utils/fileValidation';

const result = validateFile(file);
if (!result.valid) {
  setError(result.error);
  return;
}
```

**Constants:**
- `MAX_FILE_SIZE_BYTES` - Maximum allowed file size (500 MB)
- `WARNING_SIZE_BYTES` - File size threshold for warnings (50 MB)

### uploadHandler.js

**Location:** `shared/utils/uploadHandler.js`

#### `uploadVideo({file, exercise, notes, onProgress})`

Handles video upload and analysis.

**Parameters:**
- `file` (File, required) - Video file to upload
- `exercise` (string, required) - Exercise type ID
- `notes` (string|null, optional) - Optional notes
- `onProgress` (Function, optional) - Progress callback `(progress, text) => void`

**Returns:** `Promise<Object>` - Analysis result

**Example:**
```javascript
import { uploadVideo } from '../shared/utils/uploadHandler';

const result = await uploadVideo({
  file: videoFile,
  exercise: '1',
  notes: 'My workout notes',
  onProgress: (progress, text) => {
    setUploadProgress(progress);
    setUploadStatus(text);
  }
});
```

#### `uploadVideoOnly({file, onProgress})`

Handles video upload only (no analysis).

**Parameters:**
- `file` (File, required) - Video file to upload
- `onProgress` (Function, optional) - Progress callback `(progress, text) => void`

**Returns:** `Promise<Object>` - Upload result with session_id

### videoDuration.js

**Location:** `shared/utils/videoDuration.js`

#### `getVideoDuration(file)`

Gets the duration of a video file in seconds.

**Parameters:**
- `file` (File) - Video file object

**Returns:** `Promise<number>` - Duration in seconds

**Throws:** `Error` - If file is not a video or metadata cannot be loaded

**Example:**
```javascript
import { getVideoDuration } from '../shared/utils/videoDuration';

const duration = await getVideoDuration(file);
console.log(`Video is ${duration} seconds long`);
```

#### `getVideoFPS(file)`

Gets the FPS of a video file (always returns null - FPS comes from server).

**Parameters:**
- `file` (File) - Video file object

**Returns:** `Promise<null>` - Always returns null

**Note:** Actual FPS is determined by the server during analysis.

### videoMetadata.js

**Location:** `shared/utils/videoMetadata.js`

**See file for detailed function documentation.**

---

## Analysis Utilities

### analysisApi.js

**Location:** `shared/utils/analysisApi.js`

#### `getAnalyses(params)`

Get list of analyses with optional filters.

**Parameters:**
- `params` (Object, optional) - Query parameters
  - `limit` (number, optional) - Number of analyses to return (default: 20)
  - `offset` (number, optional) - Number of analyses to skip (default: 0)
  - `exercise` (number, optional) - Filter by exercise type (1=Squat, 2=Bench, 3=Deadlift)
  - `minScore` (number, optional) - Minimum score filter (0-100)
  - `maxScore` (number, optional) - Maximum score filter (0-100)
  - `startDate` (string, optional) - Start date filter (YYYY-MM-DD)
  - `endDate` (string, optional) - End date filter (YYYY-MM-DD)

**Returns:** `Promise<Object>` - Analysis list response with pagination

**Example:**
```javascript
import { getAnalyses } from '../shared/utils/analysisApi';

const analyses = await getAnalyses({
  limit: 10,
  exercise: 1,
  minScore: 80
});
```

#### `getAnalysis(analysisId, navigate)`

Get single analysis details by ID.

**Parameters:**
- `analysisId` (string, required) - Analysis ID
- `navigate` (Function, optional) - Optional navigate function for redirects on auth failure

**Returns:** `Promise<Object>` - Full analysis details

**Example:**
```javascript
import { getAnalysis } from '../shared/utils/analysisApi';

const analysis = await getAnalysis('analysis123', navigate);
```

#### `getProgressMetrics(navigate)`

Get progress metrics and trends.

**Parameters:**
- `navigate` (Function, optional) - Optional navigate function for redirects on auth failure

**Returns:** `Promise<Object>` - Progress metrics including statistics and trends

### analysisDataNormalizer.js

**Location:** `shared/utils/analysisDataNormalizer.js`

#### `normalizeAnalysisResults(analysisData)`

Normalizes analysis results to a consistent format.

**Parameters:**
- `analysisData` (Object) - Analysis data from API (immediate or history)

**Returns:** `Object|null` - Normalized analysis results object

#### `getFpsFromAnalysis(analysisData)`

Extracts FPS from analysis data.

**Parameters:**
- `analysisData` (Object) - Analysis data

**Returns:** `number|null` - FPS value or null

#### `getComponentScores(formAnalysis)`

Extracts component scores from form analysis.

**Parameters:**
- `formAnalysis` (Object) - Form analysis data

**Returns:** `Object` - Component scores object

---

## Token Management

### tokenActivation.js

**Location:** `shared/utils/tokenActivation.js`

#### `activateTokens()`

Activates the user's token system and grants 10 free tokens.

**Returns:** `Promise<{success: boolean, message: string, data?: object}>`

**Throws:** `Error` - If activation fails

**Example:**
```javascript
import { activateTokens } from '../shared/utils/tokenActivation';

try {
  const result = await activateTokens();
  console.log(result.message); // "Tokens activated! You received 10 free tokens."
} catch (error) {
  console.error('Activation failed:', error.message);
}
```

#### `createActivationHandler(setLoading, setError, onSuccess)`

Creates an activation handler function with loading state management.

**Parameters:**
- `setLoading` (Function) - State setter for loading state
- `setError` (Function) - State setter for error messages
- `onSuccess` (Function, optional) - Optional callback on successful activation

**Returns:** `Function` - Activation handler function

### tokenRefresh.js

**Location:** `shared/utils/tokenRefresh.js`

#### `refreshAccessToken()`

Refreshes the access token using the refresh token.

**Returns:** `Promise<boolean>` - True if refresh succeeded, false otherwise

**Note:** Uses singleton pattern to prevent multiple simultaneous refresh requests.

---

## Validation

### imageValidation.js

**Location:** `shared/utils/imageValidation.js`

**See file for detailed function documentation.**

---

## Chart & Plot Utilities

### chartConfig.js

**Location:** `shared/utils/chartConfig.js`

**Provides Chart.js configuration and utilities for analysis charts.**

**See file for detailed function documentation.**

### chartDataUtils.js

**Location:** `shared/utils/chartDataUtils.js`

**See file for detailed function documentation.**

### plotDataUtils.js

**Location:** `shared/utils/plotDataUtils.js`

**See file for detailed function documentation.**

---

## Score Utilities

### scoreUtils.js

**Location:** `shared/utils/scoreUtils.js`

#### `getScoreColor(score)`

Gets the appropriate CSS color variable based on score value.

**Parameters:**
- `score` (number) - Score value (0-100)

**Returns:** `string` - CSS variable name for score color
  - `'var(--score-excellent)'` for 90-100
  - `'var(--score-good)'` for 75-89
  - `'var(--score-warning)'` for 60-74
  - `'var(--score-poor)'` for 0-59

**Example:**
```javascript
import { getScoreColor } from '../shared/utils/scoreUtils';

const color = getScoreColor(85); // Returns 'var(--score-good)'
<div style={{ color: getScoreColor(score) }}>Score: {score}</div>
```

---

## Feature-Specific Utilities

### expertCoachingConstants.js

**Location:** `shared/utils/expertCoachingConstants.js`

**Note:** This file has been moved to `features/expert-coaching/utils/expertCoachingConstants.js`

**See:** [Expert Coaching Feature](../../features/expert-coaching/README.md)

### expertCoachingDateFormat.js

**Location:** `shared/utils/expertCoachingDateFormat.js`

**Note:** This file has been moved to `features/expert-coaching/utils/expertCoachingDateFormat.js`

**See:** [Expert Coaching Feature](../../features/expert-coaching/README.md)

---

## Related Documentation

- [Error Handling Guide](./ERROR_HANDLING.md) - Comprehensive error handling patterns
- [Component Catalog](../components/COMPONENTS.md) - Reusable components
- [Styling Guide](../styles/STYLING_GUIDE.md) - Styling conventions
- [API Configuration](../../config/api/README.md) - API endpoint organization

---

## Contributing

When adding new utilities:

1. Add comprehensive JSDoc comments to the utility file
2. Update this catalog with utility information
3. Include usage examples in JSDoc
4. Document all parameters with types and descriptions
5. Add notes about any special behavior or edge cases

