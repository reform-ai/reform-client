/**
 * API Error Handler Utilities
 * 
 * Provides consistent error parsing and handling for FastAPI responses.
 * FastAPI returns errors in different formats depending on the detail type:
 * - Dict detail: Returns the dict directly as response body
 *   Example: {"error": "insufficient_tokens", "message": "...", "needs_activation": true}
 * - String detail: Wraps string in {"detail": "error message"}
 * 
 * This module centralizes error handling logic so it can be reused across features.
 * 
 * @module apiErrorHandler
 */

/**
 * Parses error response from FastAPI server.
 * 
 * @param {XMLHttpRequest|Response} response - The XMLHttpRequest or Fetch Response object
 * @param {string} responseText - The response text (for XHR) or null (for Fetch)
 * @param {number} status - HTTP status code
 * @returns {{errorMsg: string, errorData: object|null}} Parsed error message and structured data
 */
export function parseErrorResponse(response, responseText = null, status = null) {
  let errorMsg = 'An error occurred';
  let errorData = null;
  
  // Handle both XHR and Fetch Response objects
  const statusCode = status || response?.status;
  const text = responseText || (response?.text ? null : response?.responseText);
  
  // Try to parse JSON error response
  let errorResponse = null;
  try {
    if (text) {
      errorResponse = JSON.parse(text);
    } else if (response?.json) {
      // For Fetch Response, we'd need to await response.json() - handled separately
      return { errorMsg: 'Error parsing response', errorData: null };
    }
  } catch (e) {
    // JSON parsing failed - will fall back to status code handling
  }
  
  // Extract error information from parsed response
  if (errorResponse) {
    // FastAPI wraps string details in {"detail": "..."}, but returns dict details directly
    const detail = errorResponse.detail !== undefined ? errorResponse.detail : errorResponse;
    
    if (typeof detail === 'string') {
      // Simple string error message
      errorMsg = detail;
    } else if (typeof detail === 'object' && detail !== null) {
      // Structured error response with additional metadata
      errorMsg = detail.message || detail.error || errorMsg;
      
      // Extract structured error data for specific error types
      // This allows the UI to show appropriate actions (e.g., activation button)
      if (detail.error === 'insufficient_tokens') {
        errorData = {
          type: 'insufficient_tokens',
          message: detail.message || errorMsg,
          needs_activation: detail.needs_activation === true,  // Used to show activation button
          tokens_required: detail.tokens_required,
          tokens_remaining: detail.tokens_remaining
        };
      } else if (detail.error) {
        // Generic structured error
        errorData = {
          type: detail.error,
          message: detail.message || errorMsg,
          ...detail  // Include all additional fields
        };
      }
    }
  }
  
  // Fallback to status code-based error messages if parsing failed or no message extracted
  if (errorMsg === 'An error occurred' || !errorResponse) {
    errorMsg = getStatusErrorMessage(statusCode) || errorMsg;
  }
  
  return { errorMsg, errorData };
}

/**
 * Gets user-friendly error message based on HTTP status code.
 * 
 * @param {number} statusCode - HTTP status code
 * @param {object|null} errorData - Existing error data (to avoid duplicate messages)
 * @returns {string|null} Error message or null if no specific message
 */
export function getStatusErrorMessage(statusCode, errorData = null) {
  if (!statusCode) return null;
  
  const statusCodeMessages = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Authentication required. Please log in and try again.',
    403: 'Access denied. You do not have permission to perform this action.',
    404: 'Resource not found.',
    402: errorData ? null : 'Payment required. Please check your account status.',
    413: 'File too large. Please use a smaller file.',
    415: 'Unsupported file format. Please use a supported format.',
    422: 'Validation error. Please check your input.',
    429: 'Too many requests. Please wait a moment and try again.',
  };
  
  if (statusCode in statusCodeMessages) {
    return statusCodeMessages[statusCode];
  }
  
  if (statusCode >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return null;
}

/**
 * Creates an Error object with structured error data attached.
 * 
 * @param {string} message - Error message
 * @param {object|null} errorData - Structured error data (optional)
 * @returns {Error} Error object with errorData property
 */
export function createErrorWithData(message, errorData = null) {
  const error = new Error(message);
  if (errorData) {
    error.errorData = errorData;
  }
  return error;
}

/**
 * Handles Fetch API error responses.
 * Use this for fetch() calls instead of parseErrorResponse.
 * 
 * @param {Response} response - Fetch Response object
 * @returns {Promise<Error>} Promise that resolves to an Error with errorData
 */
export async function handleFetchError(response) {
  let errorResponse = null;
  try {
    errorResponse = await response.json();
  } catch (e) {
    // If JSON parsing fails, use status code message
  }
  
  const { errorMsg, errorData } = parseErrorResponse(
    response,
    errorResponse ? JSON.stringify(errorResponse) : null,
    response.status
  );
  
  return createErrorWithData(errorMsg, errorData);
}

