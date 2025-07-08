import { 
  parseError, 
  getErrorInfo, 
  retryWithBackoff, 
  logError, 
  ERROR_TYPES, 
  ERROR_MESSAGES 
} from '../errorHandler';

describe('Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe('ERROR_TYPES', () => {
    it('should have all required error types', () => {
      expect(ERROR_TYPES.NETWORK).toBe('NETWORK');
      expect(ERROR_TYPES.AUTHENTICATION).toBe('AUTHENTICATION');
      expect(ERROR_TYPES.SERVER).toBe('SERVER');
      expect(ERROR_TYPES.VALIDATION).toBe('VALIDATION');
      expect(ERROR_TYPES.RATE_LIMIT).toBe('RATE_LIMIT');
      expect(ERROR_TYPES.UNKNOWN).toBe('UNKNOWN');
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have messages for all error types', () => {
      Object.values(ERROR_TYPES).forEach(errorType => {
        expect(ERROR_MESSAGES[errorType]).toBeDefined();
        expect(ERROR_MESSAGES[errorType].title).toBeDefined();
        expect(ERROR_MESSAGES[errorType].message).toBeDefined();
        expect(ERROR_MESSAGES[errorType].action).toBeDefined();
      });
    });
  });

  describe('parseError', () => {
    it('should handle null error', () => {
      const result = parseError(null);
      expect(result.type).toBe(ERROR_TYPES.UNKNOWN);
      expect(result.message).toBe('Unknown error occurred');
    });

    it('should handle network errors', () => {
      const networkError = { code: 'NETWORK_ERROR' };
      const result = parseError(networkError);
      expect(result.type).toBe(ERROR_TYPES.NETWORK);
      expect(result.message).toBe('Network connection failed');
    });

    it('should handle axios network errors', () => {
      const networkError = { code: 'ERR_NETWORK' };
      const result = parseError(networkError);
      expect(result.type).toBe(ERROR_TYPES.NETWORK);
      expect(result.message).toBe('Network connection failed');
    });

    it('should handle 401 authentication errors', () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Invalid token' }
        }
      };
      const result = parseError(authError);
      expect(result.type).toBe(ERROR_TYPES.AUTHENTICATION);
      expect(result.message).toBe('Invalid token');
    });

    it('should handle 403 authentication errors', () => {
      const authError = {
        response: {
          status: 403,
          data: { message: 'Access denied' }
        }
      };
      const result = parseError(authError);
      expect(result.type).toBe(ERROR_TYPES.AUTHENTICATION);
      expect(result.message).toBe('Access denied');
    });

    it('should handle 422 validation errors', () => {
      const validationError = {
        response: {
          status: 422,
          data: { message: 'Invalid input' }
        }
      };
      const result = parseError(validationError);
      expect(result.type).toBe(ERROR_TYPES.VALIDATION);
      expect(result.message).toBe('Invalid input');
    });

    it('should handle 429 rate limit errors', () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { message: 'Too many requests' }
        }
      };
      const result = parseError(rateLimitError);
      expect(result.type).toBe(ERROR_TYPES.RATE_LIMIT);
      expect(result.message).toBe('Too many requests');
    });

    it('should handle 500 server errors', () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };
      const result = parseError(serverError);
      expect(result.type).toBe(ERROR_TYPES.SERVER);
      expect(result.message).toBe('Internal server error');
    });

    it('should handle request timeout errors', () => {
      const timeoutError = { code: 'ECONNABORTED' };
      const result = parseError(timeoutError);
      expect(result.type).toBe(ERROR_TYPES.NETWORK);
      expect(result.message).toBe('Request timed out');
    });

    it('should handle unknown errors', () => {
      const unknownError = { message: 'Some unknown error' };
      const result = parseError(unknownError);
      expect(result.type).toBe(ERROR_TYPES.UNKNOWN);
      expect(result.message).toBe('Some unknown error');
    });

    it('should handle errors without message', () => {
      const errorWithoutMessage = {};
      const result = parseError(errorWithoutMessage);
      expect(result.type).toBe(ERROR_TYPES.UNKNOWN);
      expect(result.message).toBe('An unexpected error occurred');
    });
  });

  describe('getErrorInfo', () => {
    it('should return complete error info for network error', () => {
      const networkError = { code: 'NETWORK_ERROR' };
      const result = getErrorInfo(networkError);

      expect(result.type).toBe(ERROR_TYPES.NETWORK);
      expect(result.title).toBe(ERROR_MESSAGES[ERROR_TYPES.NETWORK].title);
      expect(result.message).toBe(ERROR_MESSAGES[ERROR_TYPES.NETWORK].message);
      expect(result.action).toBe(ERROR_MESSAGES[ERROR_TYPES.NETWORK].action);
      expect(result.technicalMessage).toBe('Network connection failed');
      expect(result.timestamp).toBeDefined();
    });

    it('should return complete error info for authentication error', () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };
      const result = getErrorInfo(authError);

      expect(result.type).toBe(ERROR_TYPES.AUTHENTICATION);
      expect(result.title).toBe(ERROR_MESSAGES[ERROR_TYPES.AUTHENTICATION].title);
      expect(result.message).toBe(ERROR_MESSAGES[ERROR_TYPES.AUTHENTICATION].message);
      expect(result.action).toBe(ERROR_MESSAGES[ERROR_TYPES.AUTHENTICATION].action);
      expect(result.technicalMessage).toBe('Token expired');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('retryWithBackoff', () => {
    it('should return result on successful operation', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on network errors', async () => {
      const networkError = { code: 'NETWORK_ERROR' };
      const mockFn = jest.fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on authentication errors', async () => {
      const authError = {
        response: { status: 401, data: { message: 'Unauthorized' } }
      };
      const mockFn = jest.fn().mockRejectedValue(authError);

      await expect(retryWithBackoff(mockFn)).rejects.toEqual(authError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on validation errors', async () => {
      const validationError = {
        response: { status: 422, data: { message: 'Invalid input' } }
      };
      const mockFn = jest.fn().mockRejectedValue(validationError);

      await expect(retryWithBackoff(mockFn)).rejects.toEqual(validationError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should stop retrying after max attempts', async () => {
      const networkError = { code: 'NETWORK_ERROR' };
      const mockFn = jest.fn().mockRejectedValue(networkError);

      await expect(retryWithBackoff(mockFn, 2)).rejects.toEqual(networkError);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff', async () => {
      const networkError = { code: 'NETWORK_ERROR' };
      const mockFn = jest.fn()
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      await retryWithBackoff(mockFn, 3, 100);
      const endTime = Date.now();

      // Should have waited at least 100ms + 200ms = 300ms
      expect(endTime - startTime).toBeGreaterThanOrEqual(300);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'test' };

      logError(error, context);

      expect(console.error).toHaveBeenCalledWith('Error occurred:', {
        title: expect.any(String),
        message: expect.any(String),
        action: expect.any(String),
        type: expect.any(String),
        technicalMessage: expect.any(String),
        timestamp: expect.any(String),
        context,
        stack: error.stack
      });
    });

    it('should log error without context', () => {
      const error = new Error('Test error');

      logError(error);

      expect(console.error).toHaveBeenCalledWith('Error occurred:', {
        title: expect.any(String),
        message: expect.any(String),
        action: expect.any(String),
        type: expect.any(String),
        technicalMessage: expect.any(String),
        timestamp: expect.any(String),
        context: {},
        stack: error.stack
      });
    });
  });
}); 