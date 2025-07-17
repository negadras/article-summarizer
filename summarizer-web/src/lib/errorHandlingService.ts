/**
 * Error handling service for consistent error management across the application
 */

import {useToast} from "@/hooks/use-toast";

// Error categories for better handling
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error with additional context
export interface AppError extends Error {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  statusCode?: number;
  retryable?: boolean;
  userMessage?: string;
  cause?: Error;
}

// Network status checker
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Create an application error with additional context
 */
export const createAppError = (
  message: string,
  options?: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    statusCode?: number;
    retryable?: boolean;
    userMessage?: string;
    cause?: Error;
  }
): AppError => {
  const error = new Error(message) as AppError;

  if (options) {
    error.category = options.category || ErrorCategory.UNKNOWN;
    error.severity = options.severity || ErrorSeverity.ERROR;
    error.statusCode = options.statusCode;
    error.retryable = options.retryable !== undefined ? options.retryable : true;
    error.userMessage = options.userMessage || getUserFriendlyMessage(error);
    error.cause = options.cause;
  }

  return error;
};

/**
 * Get a user-friendly error message based on error type
 */
export const getUserFriendlyMessage = (error: AppError | Error): string => {
  // If it's already an AppError with a user message, use that
  if ('userMessage' in error && error.userMessage) {
    return error.userMessage;
  }

  // Check if it's an AppError with category
  if ('category' in error && error.category) {
    switch (error.category) {
      case ErrorCategory.NETWORK:
        return "Network connection issue. Please check your internet connection and try again.";
      case ErrorCategory.AUTHENTICATION:
        return "Your session has expired. Please log in again.";
      case ErrorCategory.SERVER:
        return "The server encountered an error. Our team has been notified and is working on it.";
      case ErrorCategory.CLIENT:
        return "There was an issue with your request. Please try again.";
      default:
        break;
    }
  }

  // Check for specific error messages
  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes('network') || errorMessage.includes('fetch') || !isOnline()) {
    return "Network connection issue. Please check your internet connection and try again.";
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return "The request timed out. Please try again.";
  }

  if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication') || errorMessage.includes('401')) {
    return "Your session has expired. Please log in again.";
  }

  if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
    return "You don't have permission to perform this action.";
  }

  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return "The requested resource was not found.";
  }

  if (errorMessage.includes('server') || errorMessage.includes('500')) {
    return "The server encountered an error. Our team has been notified and is working on it.";
  }

  // Default message
  return "Something went wrong. Please try again later.";
};

/**
 * Categorize an error based on its properties or message
 */
export const categorizeError = (error: Error): ErrorCategory => {
  if ('category' in error && (error as AppError).category) {
    return (error as AppError).category!;
  }

  const errorMessage = error.message.toLowerCase();

  if (!isOnline() || errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('offline')) {
    return ErrorCategory.NETWORK;
  }

  if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication') || errorMessage.includes('401')) {
    return ErrorCategory.AUTHENTICATION;
  }

  if (errorMessage.includes('server') ||
    errorMessage.includes('500') ||
    errorMessage.includes('503') ||
    errorMessage.includes('502')) {
    return ErrorCategory.SERVER;
  }

  if (errorMessage.includes('invalid') ||
    errorMessage.includes('validation') ||
    errorMessage.includes('required') ||
    errorMessage.includes('400')) {
    return ErrorCategory.CLIENT;
  }

  return ErrorCategory.UNKNOWN;
};

/**
 * Determine if an error is retryable
 */
export const isRetryableError = (error: Error): boolean => {
  if ('retryable' in error && (error as AppError).retryable !== undefined) {
    return (error as AppError).retryable!;
  }

  const category = categorizeError(error);

  // Network errors and server errors are typically retryable
  return category === ErrorCategory.NETWORK || category === ErrorCategory.SERVER;
};

/**
 * Handle an error with appropriate logging and user feedback
 */
export const handleError = (
  error: Error,
  options?: {
    toast?: ReturnType<typeof useToast>;
    context?: string;
    silent?: boolean;
    onRetry?: () => void;
  }
): void => {
  const appError = 'category' in error ? error as AppError : createAppError(error.message, { cause: error });
  const category = appError.category || categorizeError(error);
  const userMessage = appError.userMessage || getUserFriendlyMessage(appError);

  // Log the error with context
  console.error(
    `[${options?.context || 'App'}] [${category}] Error:`,
    error.message,
    { error, stack: error.stack }
  );

  // Show toast notification if not silent
  if (!options?.silent && options?.toast) {
    try {
      // Try to use the toast function directly
      options.toast({
        title: category === ErrorCategory.AUTHENTICATION ? "Session Expired" : "Error",
        description: userMessage,
        variant: "destructive",
        action: isRetryableError(error) && options.onRetry ? {
          altText: "Retry",
          onClick: options.onRetry
        } : undefined
      });
    } catch (toastError) {
      // If direct usage fails, try to use the toast method
      try {
        if (options.toast.toast && typeof options.toast.toast === 'function') {
          options.toast.toast({
            title: category === ErrorCategory.AUTHENTICATION ? "Session Expired" : "Error",
            description: userMessage,
            variant: "destructive",
            action: isRetryableError(error) && options.onRetry ? {
              altText: "Retry",
              onClick: options.onRetry
            } : undefined
          });
        }
      } catch (nestedToastError) {
        // If both approaches fail, log the error but don't crash
        console.error('Failed to show toast notification:', nestedToastError);
      }
    }
  }

  // Handle authentication errors by redirecting to login
  if (category === ErrorCategory.AUTHENTICATION) {
    localStorage.removeItem('authToken');
    setTimeout(() => {
      window.location.href = '/auth';
    }, 1500);
  }
};

/**
 * Enhanced retry function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
    retryableStatusCodes?: number[];
    retryableCategories?: ErrorCategory[];
    onRetry?: (attempt: number, delay: number, error: Error) => void;
  }
): Promise<T> {
  const maxAttempts = options?.maxAttempts || 3;
  const initialDelayMs = options?.initialDelayMs || 1000;
  const maxDelayMs = options?.maxDelayMs || 10000;
  const backoffFactor = options?.backoffFactor || 2;
  const retryableStatusCodes = options?.retryableStatusCodes || [408, 429, 500, 502, 503, 504];
  const retryableCategories = options?.retryableCategories || [ErrorCategory.NETWORK, ErrorCategory.SERVER];

  let attempt = 1;
  let lastError: Error | null = null;

  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const appError = lastError as AppError;
      const shouldRetry =
        attempt < maxAttempts &&
        (
          // Explicitly marked as retryable
          (appError.retryable === true) ||
          // Status code is in retryable list
          (appError.statusCode && retryableStatusCodes.includes(appError.statusCode)) ||
          // Category is in retryable list
          (appError.category && retryableCategories.includes(appError.category)) ||
          // Default categorization is retryable
          retryableCategories.includes(categorizeError(lastError))
        );

      if (!shouldRetry) {
        throw lastError;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffFactor, attempt - 1) * (0.8 + Math.random() * 0.4),
        maxDelayMs
      );

      // Notify about retry if callback provided
      if (options?.onRetry) {
        options.onRetry(attempt, delay, lastError);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      attempt++;
    }
  }

  // If we've exhausted all attempts, throw the last error
  throw lastError;
}

/**
 * Offline-first data fetcher with cache fallback
 */
export async function offlineFirstFetch<T>(
  fetchFn: () => Promise<T>,
  fallbackFn: () => T | null,
  options?: {
    retryOptions?: Parameters<typeof withRetry>[1];
    forceRefresh?: boolean;
  }
): Promise<T> {
  // If we're offline and have a fallback, use it immediately
  if (!isOnline() && !options?.forceRefresh) {
    const fallbackData = fallbackFn();
    if (fallbackData !== null) {
      return fallbackData;
    }
  }

  // Try to fetch with retry
  try {
    return await withRetry(fetchFn, options?.retryOptions);
  } catch (error) {
    // If fetch fails and we have fallback data, use it
    const fallbackData = fallbackFn();
    if (fallbackData !== null) {
      return fallbackData;
    }

    // Otherwise, rethrow the error
    throw error;
  }
}
