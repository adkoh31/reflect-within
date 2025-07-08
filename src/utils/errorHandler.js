// Error types for better categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  SERVER: 'SERVER',
  VALIDATION: 'VALIDATION',
  RATE_LIMIT: 'RATE_LIMIT',
  UNKNOWN: 'UNKNOWN'
};

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: {
    title: 'Connection Issue',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    action: 'Retry'
  },
  [ERROR_TYPES.AUTHENTICATION]: {
    title: 'Authentication Error',
    message: 'Your session has expired. Please sign in again.',
    action: 'Sign In'
  },
  [ERROR_TYPES.SERVER]: {
    title: 'Server Error',
    message: 'Something went wrong on our end. We\'re working to fix it.',
    action: 'Try Again'
  },
  [ERROR_TYPES.VALIDATION]: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    action: 'Fix & Retry'
  },
  [ERROR_TYPES.RATE_LIMIT]: {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests. Please wait a moment and try again.',
    action: 'Wait & Retry'
  },
  [ERROR_TYPES.UNKNOWN]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Retry'
  }
};

// Parse axios error and return error type
export const parseError = (error) => {
  if (!error) return { type: ERROR_TYPES.UNKNOWN, message: 'Unknown error occurred' };

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
    return { type: ERROR_TYPES.NETWORK, message: 'Network connection failed' };
  }

  // HTTP status code errors
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        return { 
          type: ERROR_TYPES.AUTHENTICATION, 
          message: data?.message || 'Authentication failed' 
        };
      case 403:
        return { 
          type: ERROR_TYPES.AUTHENTICATION, 
          message: data?.message || 'Access denied' 
        };
      case 422:
        return { 
          type: ERROR_TYPES.VALIDATION, 
          message: data?.message || 'Invalid input provided' 
        };
      case 429:
        return { 
          type: ERROR_TYPES.RATE_LIMIT, 
          message: data?.message || 'Too many requests' 
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return { 
          type: ERROR_TYPES.SERVER, 
          message: data?.message || 'Server error occurred' 
        };
      default:
        return { 
          type: ERROR_TYPES.UNKNOWN, 
          message: data?.message || `HTTP ${status} error` 
        };
    }
  }

  // Request timeout
  if (error.code === 'ECONNABORTED') {
    return { type: ERROR_TYPES.NETWORK, message: 'Request timed out' };
  }

  return { 
    type: ERROR_TYPES.UNKNOWN, 
    message: error.message || 'An unexpected error occurred' 
  };
};

// Get user-friendly error info
export const getErrorInfo = (error) => {
  const parsedError = parseError(error);
  const errorInfo = ERROR_MESSAGES[parsedError.type];
  
  return {
    ...errorInfo,
    type: parsedError.type,
    technicalMessage: parsedError.message,
    timestamp: new Date().toISOString()
  };
};

// Retry mechanism with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const parsedError = parseError(error);
      
      // Don't retry on certain error types
      if (parsedError.type === ERROR_TYPES.AUTHENTICATION || 
          parsedError.type === ERROR_TYPES.VALIDATION) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Log error for debugging (in production, this would go to a service like Sentry)
export const logError = (error, context = {}) => {
  const errorInfo = getErrorInfo(error);
  console.error('Error occurred:', {
    ...errorInfo,
    context,
    stack: error.stack
  });
}; 