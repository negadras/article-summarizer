import {beforeEach, describe, expect, it, vi} from 'vitest';
import {showcaseService} from './showcaseService';
import {cacheService} from './cacheService';

// Mock the cacheService
vi.mock('./cacheService', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    clearByPrefix: vi.fn()
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
      vi.mocked(cacheService.get).mockReturnValue(mockCachedData);

      const result = await showcaseService.getShowcaseSummaries();

      expect(cacheService.get).toHaveBeenCalled();
      expect(result).toEqual(mockCachedData);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch data from API when cache is empty', async () => {
      // Setup cache to return null (no cached data)
      vi.mocked(cacheService.get).mockReturnValue(null);

      // Mock successful API response
      const mockApiResponse = {
        summaries: [{ id: 'api-1', title: 'API Showcase Summary' }],
        totalPages: 3,
        currentPage: 0
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);

      const result = await showcaseService.getShowcaseSummaries();

      expect(cacheService.get).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });

    it('should handle API errors gracefully', async () => {
      // Setup cache to return null (no cached data)
      vi.mocked(cacheService.get).mockReturnValue(null);

      // Mock fetch to throw an error
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await showcaseService.getShowcaseSummaries();

      expect(cacheService.get).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.summaries).toBeInstanceOf(Array);
      expect(result.summaries.length).toBeGreaterThan(0);
    });

    it('should handle non-ok API responses', async () => {
      // Setup cache to return null (no cached data)
      vi.mocked(cacheService.get).mockReturnValue(null);

      // Mock failed API response
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      const result = await showcaseService.getShowcaseSummaries();

      expect(cacheService.get).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.summaries).toBeInstanceOf(Array);
    });

    it('should handle query parameters correctly', async () => {
      // Setup cache to return null (no cached data)
      vi.mocked(cacheService.get).mockReturnValue(null);

      // Mock fetch to throw an error (we're just testing the URL construction)
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await showcaseService.getShowcaseSummaries({
        page: 2,
        size: 5,
        category: 'Technology'
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('?page=2&size=5&category=Technology'),
        expect.anything()
      );
    });

    it('should use correct cache key based on query parameters', async () => {
      // Setup cache to return null (no cached data)
      vi.mocked(cacheService.get).mockReturnValue(null);

      // Mock fetch to throw an error
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await showcaseService.getShowcaseSummaries({
        page: 2,
        size: 5,
        category: 'Technology'
      });

      expect(cacheService.get).toHaveBeenCalledWith(
        'showcase_?page=2&size=5&category=Technology'
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
