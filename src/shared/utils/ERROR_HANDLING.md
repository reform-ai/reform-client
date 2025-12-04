# Error Handling Guide

This guide explains how to handle errors consistently throughout the Reform Client application.

## Overview

The error handling system provides:
- **Standardized error display components** - Consistent UI for errors
- **Error handling utilities** - Functions for processing and displaying errors
- **Error boundaries** - React error boundaries for catching crashes
- **API error parsing** - Consistent parsing of FastAPI error responses

## Error Display Components

### ErrorBanner

Use for prominent error messages that need user attention.

```jsx
import ErrorBanner from '../shared/components/errors/ErrorBanner';

// Basic usage
<ErrorBanner message="Failed to load data" />

// With dismiss button
<ErrorBanner 
  message="Operation failed"
  onDismiss={() => setError(null)}
/>

// Warning type
<ErrorBanner 
  message="This action cannot be undone"
  type="warning"
/>
```

**When to use:**
- API errors that prevent page functionality
- Critical operation failures
- Important warnings that need user attention

### ErrorMessage

Use for inline error messages, typically in forms.

```jsx
import ErrorMessage from '../shared/components/errors/ErrorMessage';

// Basic usage
<ErrorMessage message="This field is required" />

// Medium size
<ErrorMessage 
  message="Invalid email format"
  size="medium"
/>
```

**When to use:**
- Form validation errors
- Field-specific errors
- Inline error messages

### ErrorBoundary

Use to catch JavaScript errors and prevent app crashes.

```jsx
import ErrorBoundary from '../shared/components/errors/ErrorBoundary';

// Basic usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// With error callback
<ErrorBoundary onError={(error, info) => logErrorToService(error, info)}>
  <MyComponent />
</ErrorBoundary>
```

**When to use:**
- Wrap entire page components
- Wrap complex feature sections
- Wrap third-party components that might crash

## Error Handling Utilities

### handleApiError

Processes API errors and extracts user-friendly messages.

```jsx
import { handleApiError } from '../shared/utils/errorHandling';

try {
  await authenticatedFetch(url);
} catch (error) {
  const { message, errorData } = handleApiError(error, {
    defaultMessage: 'Failed to load data',
    logToConsole: true,
  });
  setError(message);
}
```

**Returns:**
- `message` (string) - User-friendly error message
- `errorData` (object|null) - Structured error data from API

### displayUserError

Displays errors to users using appropriate method.

```jsx
import { displayUserError } from '../shared/utils/errorHandling';

try {
  await someOperation();
} catch (error) {
  displayUserError(error, setError, {
    defaultMessage: 'Operation failed'
  });
}
```

**Preferred:** Use state setter (setError) for better UX  
**Avoid:** Using `useAlert: true` - alerts are disruptive

### handleValidationError

Handles form validation errors with field-specific messages.

```jsx
import { handleValidationError } from '../shared/utils/errorHandling';

try {
  await submitForm(formData);
} catch (error) {
  const { fieldErrors, generalError } = handleValidationError(error, {
    setFieldErrors: setFormErrors,
    setGeneralError: setError
  });
}
```

**Returns:**
- `fieldErrors` (object) - Field-specific errors: `{ fieldName: 'error message' }`
- `generalError` (string|null) - General form error message

### getUserFriendlyMessage

Extracts user-friendly message from various error formats.

```jsx
import { getUserFriendlyMessage } from '../shared/utils/errorHandling';

const message = getUserFriendlyMessage(error, 'Operation failed');
setError(message);
```

### shouldShowError

Determines if an error should be shown to the user.

```jsx
import { shouldShowError, getUserFriendlyMessage } from '../shared/utils/errorHandling';

if (shouldShowError(error)) {
  setError(getUserFriendlyMessage(error));
}
```

**Note:** Some errors (like 401 Unauthorized) are handled automatically and shouldn't be shown.

## Common Patterns

### Pattern 1: API Call with Error Display

```jsx
import { useState } from 'react';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import { displayUserError } from '../shared/utils/errorHandling';
import ErrorBanner from '../shared/components/errors/ErrorBanner';

function MyComponent() {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      const result = await authenticatedFetchJson(url, {}, navigate);
      setData(result);
    } catch (error) {
      displayUserError(error, setError, {
        defaultMessage: 'Failed to load data'
      });
    }
  };

  return (
    <div>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {/* Component content */}
    </div>
  );
}
```

### Pattern 2: Form Submission with Validation Errors

```jsx
import { useState } from 'react';
import { handleValidationError } from '../shared/utils/errorHandling';
import ErrorBanner from '../shared/components/errors/ErrorBanner';
import ErrorMessage from '../shared/components/errors/ErrorMessage';

function MyForm() {
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      setFieldErrors({});
      await submitForm(formData);
    } catch (error) {
      handleValidationError(error, {
        setFieldErrors,
        setGeneralError: setError
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorBanner message={error} />}
      
      <div>
        <input name="email" />
        {fieldErrors.email && <ErrorMessage message={fieldErrors.email} />}
      </div>
      
      {/* More fields */}
    </form>
  );
}
```

### Pattern 3: Error Boundary for Page

```jsx
import ErrorBoundary from '../shared/components/errors/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyPage />
    </ErrorBoundary>
  );
}
```

## Error Types

### API Errors

API errors come from the backend and are parsed by `apiErrorHandler.js`:
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required (handled automatically)
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation errors
- **429 Too Many Requests** - Rate limiting
- **500+ Server Error** - Server-side errors

### Validation Errors

Validation errors (422) include field-specific errors:
```json
{
  "detail": [
    { "loc": ["body", "email"], "msg": "Invalid email format" },
    { "loc": ["body", "password"], "msg": "Password too short" }
  ]
}
```

### Network Errors

Network errors occur when requests fail:
- Connection timeout
- Network unavailable
- CORS errors

Handle with:
```jsx
catch (error) {
  if (error.message.includes('fetch')) {
    setError('Network error. Please check your connection.');
  } else {
    displayUserError(error, setError);
  }
}
```

## Best Practices

### ✅ DO

- Use `ErrorBanner` for prominent errors
- Use `ErrorMessage` for inline/form errors
- Use `displayUserError` with state setters
- Use `handleValidationError` for form errors
- Wrap pages/components with `ErrorBoundary`
- Provide clear, actionable error messages
- Log errors to console in development

### ❌ DON'T

- Don't use `alert()` for errors (use state + ErrorBanner)
- Don't show technical error details to users
- Don't ignore errors silently
- Don't show 401 errors (handled automatically)
- Don't use generic "Error occurred" messages
- Don't forget to clear errors on retry

## Migration Guide

### Replacing alert() calls

**Before:**
```jsx
catch (error) {
  alert(error.message);
}
```

**After:**
```jsx
catch (error) {
  displayUserError(error, setError, {
    defaultMessage: 'Operation failed'
  });
}
```

### Replacing inline error display

**Before:**
```jsx
{error && (
  <div style={{ color: 'red' }}>
    {error}
  </div>
)}
```

**After:**
```jsx
import ErrorBanner from '../shared/components/errors/ErrorBanner';

{error && (
  <ErrorBanner 
    message={error} 
    onDismiss={() => setError(null)}
  />
)}
```

### Adding Error Boundaries

**Before:**
```jsx
function App() {
  return <MyPage />;
}
```

**After:**
```jsx
import ErrorBoundary from '../shared/components/errors/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyPage />
    </ErrorBoundary>
  );
}
```

## Related Documentation

- [API Error Handler](../utils/apiErrorHandler.js) - API error parsing utilities
- [Authenticated Fetch](../utils/authenticatedFetch.js) - API request utilities
- [Component Catalog](../components/COMPONENTS.md) - Error display components

