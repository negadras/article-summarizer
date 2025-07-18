import {beforeEach, describe, expect, it, vi} from 'vitest';
import {showcaseService} from './showcaseService';
import {cacheService} from './cacheService';

// Mock the cacheService
vi.mock('./cacheService', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    clearByPrefix: vi.fn(),
    getOrFetch: vi.fn()
  }
}));

// Mock fetch
global.fetch = vi.fn();

describe('showcaseService', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
  });

  describe('getShowcaseSummaries', () => {
    it('should return cached data when available', async () => {
      const mockCachedData = {
        summaries: [{ id: 'cached-1', title: 'Cached Showcase Summary' }],
        totalPages: 2,
        currentPage: 1
      };

      // Setup cache to return mock data
      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockCachedData);

      const result = await showcaseService.getShowcaseSummaries();

      expect(cacheService.getOrFetch).toHaveBeenCalled();
      expect(result).toEqual(mockCachedData);
    });

    it('should fetch data from API when cache is empty', async () => {
      // Mock successful API response
      const mockApiResponse = {
        summaries: [{ id: 'api-1', title: 'API Showcase Summary' }],
        totalPages: 3,
        currentPage: 0
      };

      // Setup cache to return the fetched data
      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockApiResponse);

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);

      const result = await showcaseService.getShowcaseSummaries();

      expect(cacheService.getOrFetch).toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });

    it('should handle API errors gracefully', async () => {
      // Mock error fallback data
      const mockFallbackData = {
        summaries: [],
        totalPages: 0,
        currentPage: 0
      };

      // Setup cache to return fallback data
      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockFallbackData);

      // Mock fetch to throw an error
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await showcaseService.getShowcaseSummaries();

      expect(cacheService.getOrFetch).toHaveBeenCalled();
      expect(result).toEqual(mockFallbackData);
    });

    it('should handle non-ok API responses', async () => {
      // Mock fallback data for non-ok responses
      const mockFallbackData = {
        summaries: [],
        totalPages: 0,
        currentPage: 0
      };

      // Setup cache to return fallback data
      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockFallbackData);

      // Mock failed API response
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      const result = await showcaseService.getShowcaseSummaries();

      expect(cacheService.getOrFetch).toHaveBeenCalled();
      expect(result).toEqual(mockFallbackData);
    });

    it('should handle query parameters correctly', async () => {
      // Mock data for query parameter test
      const mockData = {
        summaries: [],
        totalPages: 0,
        currentPage: 0
      };

      // Setup cache to return mock data
      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockData);

      await showcaseService.getShowcaseSummaries({
        page: 2,
        size: 5,
        category: 'Technology'
      });

      expect(cacheService.getOrFetch).toHaveBeenCalledWith(
        expect.stringContaining('showcase_?page=2&size=5&category=Technology'),
        expect.any(Function),
        expect.any(Number)
      );
    });

    it('should use correct cache key based on query parameters', async () => {
      // Mock data for cache key test
      const mockData = {
        summaries: [],
        totalPages: 0,
        currentPage: 0
      };

      // Setup cache to return mock data
      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockData);

      await showcaseService.getShowcaseSummaries({
        page: 2,
        size: 5,
        category: 'Technology'
      });

      expect(cacheService.getOrFetch).toHaveBeenCalledWith(
        'showcase_?page=2&size=5&category=Technology',
        expect.any(Function),
        expect.any(Number)
      );
    });
  });

  describe('clearCache', () => {
    it('should call clearByPrefix on the cacheService', () => {
      showcaseService.clearCache();

      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('showcase_');
    });
  });
});
