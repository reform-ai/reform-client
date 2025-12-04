/**
 * Error Handling Utilities
 * 
 * Provides standardized functions for handling and displaying errors
 * throughout the application. Builds on top of apiErrorHandler.js
 * for consistent error handling patterns.
 * 
 * @module errorHandling
 */

import { handleFetchError, parseErrorResponse, getStatusErrorMessage } from './apiErrorHandler';

/**
 * Handles API errors with standardized user-facing messages
 * 
 * Extracts user-friendly error messages from API responses and
 * provides consistent error handling patterns.
 * 
 * @param {Error} error - Error object from API call
 * @param {Object} options - Error handling options
 * @param {string} [options.defaultMessage] - Default message if error message cannot be extracted
 * @param {boolean} [options.logToConsole=true] - Whether to log error to console
 * @param {Function} [options.onError] - Optional callback with error details
 * 
 * @returns {Object} Object with message and errorData
 *   - message: string - User-friendly error message
 *   - errorData: object|null - Structured error data from API
 * 
 * @example
 * try {
 *   await authenticatedFetch(url);
 * } catch (error) {
 *   const { message, errorData } = handleApiError(error, {
 *     defaultMessage: 'Failed to load data'
 *   });
 *   setError(message);
 * }
 */
export function handleApiError(error, options = {}) {
  const {
    defaultMessage = 'An error occurred. Please try again.',
    logToConsole = true,
    onError = null,
  } = options;

  // Log error to console if enabled
  if (logToConsole) {
    console.error('API Error:', error);
  }

  // Extract message from error
  let message = defaultMessage;
  let errorData = null;

  // If error has errorData (from apiErrorHandler), use it
  if (error.errorData) {
    errorData = error.errorData;
    message = error.message || errorData.message || defaultMessage;
  } else if (error.message) {
    // Use error message directly
    message = error.message;
  }

  // Call optional error callback
  if (onError) {
    onError(error, message, errorData);
  }

  return { message, errorData };
}

/**
 * Displays error message to user using appropriate method
 * 
 * Provides a standardized way to show errors to users. Prefers
 * setting error state over alert() for better UX.
 * 
 * @param {Error|string} error - Error object or error message string
 * @param {Function} setError - State setter function for error state
 * @param {Object} options - Display options
 * @param {string} [options.defaultMessage] - Default message if error message cannot be extracted
 * @param {boolean} [options.useAlert=false] - Whether to use alert() (not recommended)
 * 
 * @example
 * // Preferred: Using state setter
 * try {
 *   await someOperation();
 * } catch (error) {
 *   displayUserError(error, setError, {
 *     defaultMessage: 'Operation failed'
 *   });
 * }
 * 
 * @example
 * // Fallback: Using alert (not recommended, but available)
 * displayUserError(error, null, {
 *   defaultMessage: 'Operation failed',
 *   useAlert: true
 * });
 */
export function displayUserError(error, setError, options = {}) {
  const {
    defaultMessage = 'An error occurred. Please try again.',
    useAlert = false,
  } = options;

  const { message } = handleApiError(error, {
    defaultMessage,
    logToConsole: true,
  });

  if (setError) {
    // Preferred: Set error state for component to display
    setError(message);
  } else if (useAlert) {
    // Fallback: Use alert (not recommended for production)
    alert(message);
  } else {
    // Last resort: Log to console
    console.error('Error (no display method):', message);
  }
}

/**
 * Handles validation errors from form submissions
 * 
 * Extracts and formats validation errors from API responses,
 * typically from 422 status codes with detailed field errors.
 * 
 * @param {Error} error - Error object from API call
 * @param {Object} options - Validation error handling options
 * @param {Function} [options.setFieldErrors] - Function to set field-specific errors
 * @param {Function} [options.setGeneralError] - Function to set general form error
 * 
 * @returns {Object} Object with fieldErrors and generalError
 *   - fieldErrors: object - Field-specific error messages { fieldName: 'error message' }
 *   - generalError: string|null - General form error message
 * 
 * @example
 * try {
 *   await submitForm(formData);
 * } catch (error) {
 *   const { fieldErrors, generalError } = handleValidationError(error, {
 *     setFieldErrors: setFormErrors,
 *     setGeneralError: setError
 *   });
 * }
 */
export function handleValidationError(error, options = {}) {
  const { setFieldErrors, setGeneralError } = options;

  const { message, errorData } = handleApiError(error, {
    defaultMessage: 'Please check your input and try again.',
  });

  // Extract field-specific errors if available
  let fieldErrors = {};
  let generalError = message;

  if (errorData && errorData.detail) {
    // FastAPI validation errors often have detail with field errors
    if (Array.isArray(errorData.detail)) {
      // Format: [{ loc: ['field'], msg: 'error message' }]
      errorData.detail.forEach((err) => {
        if (err.loc && err.loc.length > 0) {
          const fieldName = err.loc[err.loc.length - 1];
          fieldErrors[fieldName] = err.msg;
        }
      });
      generalError = Object.keys(fieldErrors).length > 0 
        ? 'Please fix the errors below and try again.'
        : message;
    } else if (typeof errorData.detail === 'object') {
      // Format: { fieldName: 'error message' }
      fieldErrors = errorData.detail;
      generalError = 'Please fix the errors below and try again.';
    }
  }

  // Set errors using provided functions
  if (setFieldErrors && Object.keys(fieldErrors).length > 0) {
    setFieldErrors(fieldErrors);
  }

  if (setGeneralError) {
    setGeneralError(generalError);
  }

  return { fieldErrors, generalError };
}

/**
 * Creates a user-friendly error message from various error types
 * 
 * Handles different error formats and creates consistent, user-friendly messages.
 * 
 * @param {Error|string|object} error - Error in various formats
 * @param {string} defaultMessage - Default message if error cannot be parsed
 * 
 * @returns {string} User-friendly error message
 * 
 * @example
 * const message = getUserFriendlyMessage(error, 'Operation failed');
 */
export function getUserFriendlyMessage(error, defaultMessage = 'An error occurred') {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    // Check if error has errorData (from apiErrorHandler)
    if (error.errorData && error.errorData.message) {
      return error.errorData.message;
    }
    return error.message || defaultMessage;
  }

  if (error && typeof error === 'object') {
    if (error.message) {
      return error.message;
    }
    if (error.error) {
      return error.error;
    }
  }

  return defaultMessage;
}

/**
 * Determines if an error should be shown to the user
 * 
 * Some errors (like 401 Unauthorized) are handled automatically
 * and shouldn't be shown to users. This function helps determine
 * which errors should be displayed.
 * 
 * @param {Error} error - Error object
 * 
 * @returns {boolean} Whether error should be shown to user
 * 
 * @example
 * if (shouldShowError(error)) {
 *   setError(getUserFriendlyMessage(error));
 * }
 */
export function shouldShowError(error) {
  // Don't show 401 errors - they're handled by authenticatedFetch
  if (error.message && error.message.includes('401')) {
    return false;
  }

  // Don't show authentication-related errors that are handled automatically
  if (error.message && (
    error.message.includes('Authentication required') ||
    error.message.includes('Unauthorized')
  )) {
    return false;
  }

  return true;
}

