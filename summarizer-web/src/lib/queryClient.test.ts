import {beforeEach, describe, expect, it, vi} from 'vitest';
import {apiRequest} from './queryClient';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('queryClient error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should handle JSON error responses correctly', async () => {
    // Given
    const errorResponse = {
      message: "Service temporarily unavailable.",
      details: "Our AI summarization service is currently experiencing issues. Please try again later or contact support if the problem persists."
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: vi.fn().mockResolvedValueOnce(JSON.stringify(errorResponse))
    });

    // When & Then
    await expect(apiRequest('POST', '/api/summarize/text', { content: 'test' }))
      .rejects.toThrow('Service temporarily unavailable.');
  });

  it('should handle non-JSON error responses', async () => {
    // Given
    const plainTextError = 'Internal Server Error';

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: vi.fn().mockResolvedValueOnce(plainTextError)
    });

    // When & Then
    await expect(apiRequest('POST', '/api/summarize/text', { content: 'test' }))
      .rejects.toThrow('Internal Server Error');
  });

  it('should handle empty error responses', async () => {
    // Given
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: vi.fn().mockResolvedValueOnce('')
    });

    // When & Then
    await expect(apiRequest('POST', '/api/summarize/text', { content: 'test' }))
      .rejects.toThrow('Internal Server Error');
  });

  it('should handle malformed JSON error responses', async () => {
    // Given
    const malformedJson = '{"message": "Error", "details":';

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: vi.fn().mockResolvedValueOnce(malformedJson)
    });

    // When & Then
    await expect(apiRequest('POST', '/api/summarize/text', { content: 'test' }))
      .rejects.toThrow('{"message": "Error", "details":');
  });

  it('should handle text read failures gracefully', async () => {
    // Given
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: vi.fn().mockRejectedValueOnce(new Error('Failed to read response'))
    });

    // When & Then
    await expect(apiRequest('POST', '/api/summarize/text', { content: 'test' }))
      .rejects.toThrow('Request failed: 503 Service Unavailable');
  });

  it('should extract message from backend error response', async () => {
    // Given
    const backendErrorResponse = {
      message: "Service temporarily unavailable.",
      details: "Our AI service is currently experiencing issues. Please try again later."
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      text: vi.fn().mockResolvedValueOnce(JSON.stringify(backendErrorResponse))
    });

    // When & Then
    await expect(apiRequest('POST', '/api/summarize/url', { url: 'http://example.com' }))
      .rejects.toThrow('Service temporarily unavailable.');
  });

  it('should fallback to details if message is not available', async () => {
    // Given
    const backendErrorResponse = {
      details: "Our AI service is currently experiencing issues."
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      text: vi.fn().mockResolvedValueOnce(JSON.stringify(backendErrorResponse))
    });

    // When & Then
    await expect(apiRequest('POST', '/api/summarize/url', { url: 'http://example.com' }))
      .rejects.toThrow('Our AI service is currently experiencing issues.');
  });

  it('should succeed with valid responses', async () => {
    // Given
    const successResponse = { success: true, data: 'test' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce(successResponse)
    });

    // When
    const response = await apiRequest('GET', '/api/test');

    // Then
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
  });
});
