import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {userStatsService} from './userStatsService';
import {cacheService} from './cacheService';

// Mock the cacheService
vi.mock('./cacheService', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    clearUserCache: vi.fn()
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

describe('userStatsService', () => {
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

  describe('getUserStats', () => {
    it('should handle missing token gracefully', async () => {
      // Clear the token
      localStorageMock.removeItem('authToken');

      const result = await userStatsService.getUserStats();

      // Should return mock data
      expect(result).toBeDefined();
      expect(result.totalSummaries).toBeDefined();
      expect(result.wordsSaved).toBeDefined();
      expect(result.timeSaved).toBeDefined();
    });

    it('should return cached data when available', async () => {
      const mockCachedData = {
        totalSummaries: 10,
        wordsSaved: 5000,
        timeSaved: 25
      };

      // Setup cache to return mock data
      vi.mocked(cacheService.get).mockReturnValue(mockCachedData);

      const result = await userStatsService.getUserStats();

      expect(cacheService.get).toHaveBeenCalled();
      expect(result).toEqual(mockCachedData);
    });

    it('should return mock data when no cached data is available', async () => {
      // Setup cache to return null (no cached data)
      vi.mocked(cacheService.get).mockReturnValue(null);

      const result = await userStatsService.getUserStats();

      expect(cacheService.get).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.totalSummaries).toBeDefined();
      expect(result.wordsSaved).toBeDefined();
      expect(result.timeSaved).toBeDefined();
    });
  });

  describe('clearCache', () => {
    it('should call clearUserCache on the cacheService', () => {
      userStatsService.clearCache();

      expect(cacheService.clearUserCache).toHaveBeenCalled();
    });
  });
});
