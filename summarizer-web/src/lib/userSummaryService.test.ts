import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {userSummaryService} from './userSummaryService';
import {cacheService} from './cacheService';

// Mock the cacheService
vi.mock('./cacheService', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clearUserCache: vi.fn(),
    clearByPrefix: vi.fn(),
    getOrFetch: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('userSummaryService', () => {
  const mockToken = 'mock-token-12345678';

  beforeEach(() => {
    // Setup localStorage with mock token
    localStorageMock.setItem('authToken', mockToken);

    // Reset all mocks
    vi.resetAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('getUserSummaries', () => {
    it('should return mock data when no token is available', async () => {
      // Clear the token
      localStorageMock.removeItem('authToken');

      const expectedResult = {
        summaries: [{ id: '1', title: 'Mock Summary' }],
        totalPages: 1,
        currentPage: 0,
        totalCount: 5
      };

      vi.mocked(cacheService.getOrFetch).mockResolvedValue(expectedResult);

      const result = await userSummaryService.getUserSummaries();

      expect(result).toBeDefined();
      expect(result.summaries).toBeInstanceOf(Array);
      expect(result.summaries.length).toBeGreaterThan(0);
      expect(result.totalPages).toBe(1);
      expect(result.currentPage).toBe(0);
    });

    it('should return cached data when available', async () => {
      const mockCachedData = {
        summaries: [{ id: 'cached-1', title: 'Cached Summary' }],
        totalPages: 2,
        currentPage: 1,
        totalCount: 10
      };

      // Setup cache to return mock data
      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockCachedData);

      const result = await userSummaryService.getUserSummaries();

      expect(cacheService.getOrFetch).toHaveBeenCalled();
      expect(result).toEqual(mockCachedData);
    });

    it('should cache mock data when no cached data is available', async () => {
      const mockData = {
        summaries: [{ id: '1', title: 'Mock Summary' }],
        totalPages: 1,
        currentPage: 0,
        totalCount: 5
      };

      // Setup cache to return mock data
      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockData);

      const result = await userSummaryService.getUserSummaries();

      expect(cacheService.getOrFetch).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.summaries).toBeInstanceOf(Array);
    });

    it('should handle saved filter correctly', async () => {
      const mockSavedSummaries = {
        summaries: [{ id: '1', title: 'Saved Summary', saved: true }],
        totalPages: 1,
        currentPage: 0,
        totalCount: 1
      };

      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockSavedSummaries);

      const result = await userSummaryService.getUserSummaries({ saved: true });

      expect(result).toBeDefined();
      expect(result.summaries).toBeInstanceOf(Array);
      // All returned summaries should be saved
      expect(result.summaries.every(summary => summary.saved)).toBe(true);
    });
  });

  describe('getUserSummary', () => {
    it('should return a specific summary by ID', async () => {
      const summaryId = '1';
      const mockSummary = { id: summaryId, title: 'Test Summary' };

      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockSummary);

      const result = await userSummaryService.getUserSummary(summaryId);

      expect(result).toBeDefined();
      expect(result.id).toBe(summaryId);
    });

    it('should return cached data when available', async () => {
      const summaryId = '1';
      const mockCachedData = { id: summaryId, title: 'Cached Summary Detail' };

      // Setup cache to return mock data
      vi.mocked(cacheService.getOrFetch).mockResolvedValue(mockCachedData);

      const result = await userSummaryService.getUserSummary(summaryId);

      expect(cacheService.getOrFetch).toHaveBeenCalled();
      expect(result).toEqual(mockCachedData);
    });
  });

  describe('toggleSavedStatus', () => {
    it('should toggle saved status successfully', async () => {
      const summaryId = '1';
      const isSaved = true;

      const result = await userSummaryService.toggleSavedStatus(summaryId, isSaved);

      expect(result).toBe(true);
      expect(cacheService.clearByPrefix).toHaveBeenCalled();
    });

    it('should handle errors when no token is available', async () => {
      // Clear the token
      localStorageMock.removeItem('authToken');

      const summaryId = '1';
      const isSaved = true;

      await expect(userSummaryService.toggleSavedStatus(summaryId, isSaved)).rejects.toThrow('Authentication required');
    });
  });
});
