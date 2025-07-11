// Error types for better categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  OFFLINE: 'OFFLINE',
  AUTHENTICATION: 'AUTHENTICATION',
  SERVER: 'SERVER',
  VALIDATION: 'VALIDATION',
  RATE_LIMIT: 'RATE_LIMIT',
  STORAGE: 'STORAGE',
  AI_SERVICE: 'AI_SERVICE',
  CONTENT_TOO_LARGE: 'CONTENT_TOO_LARGE',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  UNKNOWN: 'UNKNOWN'
};

// User-friendly error messages with better context
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: {
    title: 'Connection Issue',
    message: 'Unable to connect to our services. Please check your internet connection and try again.',
    action: 'Retry',
    icon: '🌐',
    severity: 'warning'
  },
  [ERROR_TYPES.OFFLINE]: {
    title: 'You\'re Offline',
    message: 'No worries! You can continue writing. Your entries will be saved locally and synced when you\'re back online.',
    action: 'Continue Offline',
    icon: '📱',
    severity: 'info'
  },
  [ERROR_TYPES.AUTHENTICATION]: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again to continue.',
    action: 'Sign In',
    icon: '🔐',
    severity: 'error'
  },
  [ERROR_TYPES.SERVER]: {
    title: 'Service Temporarily Unavailable',
    message: 'We\'re experiencing some technical difficulties. Please try again in a few moments.',
    action: 'Try Again',
    icon: '⚙️',
    severity: 'error'
  },
  [ERROR_TYPES.VALIDATION]: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    action: 'Fix & Retry',
    icon: '✏️',
    severity: 'warning'
  },
  [ERROR_TYPES.RATE_LIMIT]: {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests. Please wait a moment before trying again.',
    action: 'Wait & Retry',
    icon: '⏱️',
    severity: 'warning'
  },
  [ERROR_TYPES.STORAGE]: {
    title: 'Storage Issue',
    message: 'Unable to save your data locally. Your browser may have storage restrictions.',
    action: 'Clear Cache',
    icon: '💾',
    severity: 'warning'
  },
  [ERROR_TYPES.AI_SERVICE]: {
    title: 'AI Service Unavailable',
    message: 'Our AI assistant is temporarily unavailable. You can still write and save your reflections.',
    action: 'Continue Writing',
    icon: '🤖',
    severity: 'warning'
  },
  [ERROR_TYPES.CONTENT_TOO_LARGE]: {
    title: 'Entry Too Large',
    message: 'Your journal entry is too large. Please shorten it or split it into multiple entries.',
    action: 'Shorten Entry',
    icon: '📝',
    severity: 'warning'
  },
  [ERROR_TYPES.DUPLICATE_ENTRY]: {
    title: 'Entry Already Exists',
    message: 'You already have an entry for this date. You can edit the existing entry instead.',
    action: 'Edit Existing',
    icon: '📅',
    severity: 'info'
  },
  [ERROR_TYPES.UNKNOWN]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Retry',
    icon: '❌',
    severity: 'error'
  }
};

// Enhanced error parsing with better detection
export const parseError = (error) => {
  if (!error) return { type: ERROR_TYPES.UNKNOWN, message: 'Unknown error occurred' };

  // Check if user is offline
  if (!navigator.onLine) {
    return { type: ERROR_TYPES.OFFLINE, message: 'No internet connection available' };
  }

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
    return { type: ERROR_TYPES.NETWORK, message: 'Network connection failed' };
  }

  // AI service specific errors
  if (error.message?.includes('API key') || error.message?.includes('OPENAI_API_KEY')) {
    return { type: ERROR_TYPES.AI_SERVICE, message: 'AI service configuration error' };
  }

  if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
    return { type: ERROR_TYPES.RATE_LIMIT, message: 'AI service rate limit reached' };
  }

  // Storage errors
  if (error.message?.includes('storage') || error.message?.includes('localStorage')) {
    return { type: ERROR_TYPES.STORAGE, message: 'Local storage access denied' };
  }

  // HTTP status code errors
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        // Check for specific validation errors
        if (data?.error === 'Content too large') {
          return { 
            type: ERROR_TYPES.CONTENT_TOO_LARGE, 
            message: data?.message || 'Entry content is too large' 
          };
        }
        if (data?.error === 'Duplicate entry') {
          return { 
            type: ERROR_TYPES.DUPLICATE_ENTRY, 
            message: data?.message || 'Entry already exists for this date' 
          };
        }
        if (data?.error === 'Validation failed' || data?.error === 'Invalid input') {
          return { 
            type: ERROR_TYPES.VALIDATION, 
            message: data?.message || 'Invalid input provided' 
          };
        }
        return { 
          type: ERROR_TYPES.VALIDATION, 
          message: data?.message || 'Invalid request' 
        };
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
      case 409:
        return { 
          type: ERROR_TYPES.DUPLICATE_ENTRY, 
          message: data?.message || 'Entry already exists' 
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

// Get user-friendly error info with enhanced context
export const getErrorInfo = (error) => {
  const parsedError = parseError(error);
  const errorInfo = ERROR_MESSAGES[parsedError.type];
  
  return {
    ...errorInfo,
    type: parsedError.type,
    technicalMessage: parsedError.message,
    timestamp: new Date().toISOString(),
    isRetryable: isRetryableError(parsedError.type),
    suggestedActions: getSuggestedActions(parsedError.type)
  };
};

// Check if error is retryable
export const isRetryableError = (errorType) => {
  const retryableTypes = [
    ERROR_TYPES.NETWORK,
    ERROR_TYPES.SERVER,
    ERROR_TYPES.RATE_LIMIT,
    ERROR_TYPES.AI_SERVICE
  ];
  return retryableTypes.includes(errorType);
};

// Get suggested actions based on error type
export const getSuggestedActions = (errorType) => {
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Check if the service is down'
      ];
    case ERROR_TYPES.OFFLINE:
      return [
        'Continue writing - data will sync later',
        'Check your WiFi or mobile data',
        'Try again when connection is restored'
      ];
    case ERROR_TYPES.STORAGE:
      return [
        'Clear browser cache and cookies',
        'Try a different browser',
        'Check browser storage settings'
      ];
    case ERROR_TYPES.AI_SERVICE:
      return [
        'Continue writing without AI responses',
        'Try again in a few minutes',
        'Check service status'
      ];
    default:
      return ['Try again', 'Refresh the page', 'Contact support if the issue persists'];
  }
};

// Enhanced retry mechanism with exponential backoff and smart retry logic
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const parsedError = parseError(error);
      
      // Don't retry on certain error types
      if (parsedError.type === ERROR_TYPES.AUTHENTICATION || 
          parsedError.type === ERROR_TYPES.VALIDATION ||
          parsedError.type === ERROR_TYPES.STORAGE) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Queue system for failed operations
export class OperationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  add(operation) {
    this.queue.push(operation);
    this.process();
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      try {
        await operation();
      } catch (error) {
        console.error('Queued operation failed:', error);
        // Could add to a failed operations queue for later retry
      }
    }
    
    this.isProcessing = false;
  }
}

// Global operation queue instance
export const globalOperationQueue = new OperationQueue();

// Enhanced error logging with context
export const logError = (error, context = {}) => {
  const errorInfo = getErrorInfo(error);
  const logData = {
    ...errorInfo,
    context,
    stack: error.stack,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
  
  console.error('Error occurred:', logData);
  
  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: sendErrorToService(logData);
  }
  
  return logData;
};

// Check if user is online
export const isOnline = () => {
  return navigator.onLine;
};

// Wait for network connection
export const waitForConnection = () => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
}; 