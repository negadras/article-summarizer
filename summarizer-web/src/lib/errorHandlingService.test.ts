import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
    categorizeError,
    createAppError,
    ErrorCategory,
    ErrorSeverity,
    getUserFriendlyMessage,
    handleError,
    isOnline,
    isRetryableError,
    offlineFirstFetch,
    withRetry
} from './errorHandlingService';

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  get: vi.fn().mockReturnValue(true)
});

describe('errorHandlingService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createAppError', () => {
    it('should create an error with default properties', () => {
      const error = createAppError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.category).toBe(ErrorCategory.UNKNOWN);
      expect(error.severity).toBe(ErrorSeverity.ERROR);
      expect(error.retryable).toBe(true);
      expect(error.userMessage).toBeDefined();
    });

    it('should create an error with custom properties', () => {
      const error = createAppError('Test error', {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.WARNING,
        statusCode: 503,
        retryable: false,
        userMessage: 'Custom user message'
      });

      expect(error.message).toBe('Test error');
      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.severity).toBe(ErrorSeverity.WARNING);
      expect(error.statusCode).toBe(503);
      expect(error.retryable).toBe(false);
      expect(error.userMessage).toBe('Custom user message');
    });

    it('should include cause if provided', () => {
      const cause = new Error('Original error');
      const error = createAppError('Test error', { cause });

      expect(error.cause).toBe(cause);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return userMessage if already set', () => {
      const error = createAppError('Test error', {
        userMessage: 'Custom user message'
      });

      expect(getUserFriendlyMessage(error)).toBe('Custom user message');
    });

    it('should return message based on error category', () => {
      const networkError = createAppError('Test error', {
        category: ErrorCategory.NETWORK,
        userMessage: undefined
      });

      expect(getUserFriendlyMessage(networkError)).toContain('Network connection');

      const authError = createAppError('Test error', {
        category: ErrorCategory.AUTHENTICATION,
        userMessage: undefined
      });

      expect(getUserFriendlyMessage(authError)).toContain('session has expired');
    });

    it('should detect network errors from message', () => {
      const error = new Error('Failed to fetch');
      expect(getUserFriendlyMessage(error)).toContain('Network connection');
    });

    it('should detect authentication errors from message', () => {
      const error = new Error('Unauthorized access');
      expect(getUserFriendlyMessage(error)).toContain('session has expired');
    });

    it('should detect server errors from message', () => {
      const error = new Error('Server error 500');
      expect(getUserFriendlyMessage(error)).toContain('server encountered an error');
    });

    it('should return default message for unknown errors', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
      const error = new Error('Some random error');
      expect(getUserFriendlyMessage(error)).toBe('Something went wrong. Please try again later.');
    });
  });

  describe('categorizeError', () => {
    it('should use existing category if available', () => {
      const error = createAppError('Test error', {
        category: ErrorCategory.SERVER
      });

      expect(categorizeError(error)).toBe(ErrorCategory.SERVER);
    });

    it('should categorize network errors', () => {
      const error = new Error('Failed to fetch');
      expect(categorizeError(error)).toBe(ErrorCategory.NETWORK);
    });

    it('should categorize authentication errors', () => {
      const error = new Error('401 Unauthorized');
      expect(categorizeError(error)).toBe(ErrorCategory.AUTHENTICATION);
    });

    it('should categorize server errors', () => {
      const error = new Error('500 Internal Server Error');
      expect(categorizeError(error)).toBe(ErrorCategory.SERVER);
    });

    it('should categorize client errors', () => {
      const error = new Error('Invalid input: validation failed');
      expect(categorizeError(error)).toBe(ErrorCategory.CLIENT);
    });

    it('should categorize unknown errors', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
      const error = new Error('Some random error');
      expect(categorizeError(error)).toBe(ErrorCategory.UNKNOWN);
    });
  });

  describe('isRetryableError', () => {
    it('should use retryable property if available', () => {
      const retryableError = createAppError('Test error', { retryable: true });
      const nonRetryableError = createAppError('Test error', { retryable: false });

      expect(isRetryableError(retryableError)).toBe(true);
      expect(isRetryableError(nonRetryableError)).toBe(false);
    });

    it('should consider network errors retryable', () => {
      const error = new Error('Failed to fetch');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should consider server errors retryable', () => {
      const error = new Error('500 Internal Server Error');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should consider client errors non-retryable', () => {
      const error = new Error('Invalid input');
      // This will be categorized as UNKNOWN which is not retryable by default
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('handleError', () => {
    it('should log the error with context', () => {
      const error = new Error('Test error');
      handleError(error, { context: 'TestContext' });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[TestContext]'),
        expect.any(String),
        expect.objectContaining({ error })
      );
    });

    it('should show toast notification if toast is provided', () => {
      const mockToast = {
        toast: vi.fn()
      };

      const error = new Error('Test error');
      handleError(error, { toast: mockToast as any });

      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        variant: 'destructive'
      }));
    });

    it('should not show toast if silent is true', () => {
      const mockToast = {
        toast: vi.fn()
      };

      const error = new Error('Test error');
      handleError(error, { toast: mockToast as any, silent: true });

      expect(mockToast.toast).not.toHaveBeenCalled();
    });

    it('should include retry action if error is retryable and onRetry is provided', () => {
      const mockToast = {
        toast: vi.fn()
      };

      const onRetry = vi.fn();
      const error = createAppError('Network error', {
        category: ErrorCategory.NETWORK,
        retryable: true
      });

      handleError(error, { toast: mockToast as any, onRetry });

      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        action: expect.objectContaining({
          label: 'Retry',
          onClick: onRetry
        })
      }));
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return result if function succeeds on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe('success');
    });

    it('should retry if function fails with retryable error', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(createAppError('Network error', { category: ErrorCategory.NETWORK }))
        .mockResolvedValueOnce('success');

      const promise = withRetry(fn);

      // Fast-forward timers to trigger retry
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(fn).toHaveBeenCalledTimes(2);
      expect(result).toBe('success');
    });

    it('should respect maxAttempts option', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(createAppError('Network error', { category: ErrorCategory.NETWORK }))
        .mockRejectedValueOnce(createAppError('Network error', { category: ErrorCategory.NETWORK }))
        .mockResolvedValueOnce('success');

      // Only allow 1 retry (2 attempts total)
      const promise = withRetry(fn, { maxAttempts: 2 });

      // Fast-forward timers to trigger retry and wait for the promise to complete
      const [, result] = await Promise.allSettled([vi.runAllTimersAsync(), promise]);

      expect(fn).toHaveBeenCalledTimes(2);
      expect(result.status).toBe('rejected');
      if (result.status === 'rejected') {
        expect(result.reason).toBeInstanceOf(Error);
      }
    });

    it('should call onRetry callback if provided', async () => {
      const onRetry = vi.fn();
      const fn = vi.fn()
        .mockRejectedValueOnce(createAppError('Network error', { category: ErrorCategory.NETWORK }))
        .mockResolvedValueOnce('success');

      const promise = withRetry(fn, { onRetry });

      // Fast-forward timers to trigger retry
      await vi.runAllTimersAsync();

      await promise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Number), expect.any(Error));
    });
  });

  describe('offlineFirstFetch', () => {
    it('should call fetchFn and return result when online', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

      const fetchFn = vi.fn().mockResolvedValue('fetch result');
      const fallbackFn = vi.fn().mockReturnValue('fallback result');

      const result = await offlineFirstFetch(fetchFn, fallbackFn);

      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fallbackFn).not.toHaveBeenCalled();
      expect(result).toBe('fetch result');
    });

    it('should use fallback when offline', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

      const fetchFn = vi.fn().mockResolvedValue('fetch result');
      const fallbackFn = vi.fn().mockReturnValue('fallback result');

      const result = await offlineFirstFetch(fetchFn, fallbackFn);

      expect(fetchFn).not.toHaveBeenCalled();
      expect(fallbackFn).toHaveBeenCalledTimes(1);
      expect(result).toBe('fallback result');
    });

    it('should use fallback when fetch fails', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

      const fetchFn = vi.fn().mockRejectedValue(new Error('Fetch failed'));
      const fallbackFn = vi.fn().mockReturnValue('fallback result');

      const result = await offlineFirstFetch(fetchFn, fallbackFn);

      expect(fetchFn).toHaveBeenCalledTimes(3); // withRetry default is 3 attempts
      expect(fallbackFn).toHaveBeenCalledTimes(1); // Called once in catch after all retries fail
      expect(result).toBe('fallback result');
    });

    it('should throw error when fetch fails and no fallback available', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

      const fetchFn = vi.fn().mockRejectedValue(new Error('Fetch failed'));
      const fallbackFn = vi.fn().mockReturnValue(null);

      await expect(offlineFirstFetch(fetchFn, fallbackFn)).rejects.toThrow('Fetch failed');

      expect(fetchFn).toHaveBeenCalledTimes(3); // withRetry default is 3 attempts
      expect(fallbackFn).toHaveBeenCalledTimes(1); // Called once in catch after all retries fail
    });

    it('should force fetch even when offline if forceRefresh is true', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

      const fetchFn = vi.fn().mockResolvedValue('fetch result');
      const fallbackFn = vi.fn().mockReturnValue('fallback result');

      try {
        await offlineFirstFetch(fetchFn, fallbackFn, { forceRefresh: true });
      } catch (error) {
        // We expect this to fail since we're offline
      }

      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
      expect(isOnline()).toBe(true);
    });

    it('should return false when navigator.onLine is false', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      expect(isOnline()).toBe(false);
    });
  });
});
