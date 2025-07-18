import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cacheService} from './cacheService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    // Helper for tests to get all keys
    _getAllKeys: () => Object.keys(store)
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('cacheService', () => {
  beforeEach(() => {
    // Reset localStorage mock
    vi.resetAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    // Reset Date.now mock if it was used
    if (vi.isMockFunction(Date.now)) {
      vi.restoreAllMocks();
    }
  });

  describe('set', () => {
    it('should store item in localStorage with expiry', () => {
      const key = 'test-key';
      const value = { name: 'Test Value' };
      const ttl = 300; // 5 minutes

      // Mock Date.now to return a fixed timestamp
      const now = 1625097600000; // 2021-07-01T00:00:00.000Z
      vi.spyOn(Date, 'now').mockReturnValue(now);

      cacheService.set(key, value, ttl);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `cache_${key}`,
        expect.stringContaining('"value":{"name":"Test Value"}')
      );
    });

    it('should use default TTL when not provided', () => {
      const key = 'test-key';
      const value = { name: 'Test Value' };

      // Mock Date.now to return a fixed timestamp
      const now = 1625097600000; // 2021-07-01T00:00:00.000Z
      vi.spyOn(Date, 'now').mockReturnValue(now);

      cacheService.set(key, value);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `cache_${key}`,
        expect.stringContaining('"expiry":' + (now + (300 * 1000)))
      );
    });

    it('should store in memory cache only when memoryOnly is true', () => {
      const key = 'memory-only-key';
      const value = { name: 'Memory Only Value' };

      cacheService.set(key, value, 300, true);

      // Should not be stored in localStorage
      expect(localStorageMock.setItem).not.toHaveBeenCalled();

      // But should be retrievable
      expect(cacheService.get(key)).toEqual(value);
    });
  });

  describe('get', () => {
    it('should return null when item does not exist', () => {
      const key = 'non-existent-key';

      // Setup localStorage.getItem to return null
      vi.mocked(localStorageMock.getItem).mockReturnValue(null);

      const result = cacheService.get(key);

      expect(localStorageMock.getItem).toHaveBeenCalledWith(`cache_${key}`);
      expect(result).toBeNull();
    });

    it('should return value when item exists and is not expired', () => {
      const key = 'valid-key';
      const value = { name: 'Test Value' };

      // Mock Date.now to return a fixed timestamp
      const now = 1625097600000; // 2021-07-01T00:00:00.000Z
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Setup localStorage.getItem to return a valid item
      vi.mocked(localStorageMock.getItem).mockReturnValue(JSON.stringify({
        value,
        expiry: now + 60000 // Expires in 1 minute
      }));

      const result = cacheService.get(key);

      expect(localStorageMock.getItem).toHaveBeenCalledWith(`cache_${key}`);
      expect(result).toEqual(value);
    });

    it('should return null and remove item when expired', () => {
      const key = 'expired-key';

      // Mock Date.now to return a fixed timestamp
      const now = 1625097600000; // 2021-07-01T00:00:00.000Z
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Setup localStorage.getItem to return an expired item
      vi.mocked(localStorageMock.getItem).mockReturnValue(JSON.stringify({
        value: { name: 'Expired Value' },
        expiry: now - 1000 // Expired 1 second ago
      }));

      const result = cacheService.get(key);

      expect(localStorageMock.getItem).toHaveBeenCalledWith(`cache_${key}`);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`cache_${key}`);
      expect(result).toBeNull();
    });

    it('should handle invalid JSON and remove the item', () => {
      const key = 'invalid-json-key';

      // Setup localStorage.getItem to return invalid JSON
      vi.mocked(localStorageMock.getItem).mockReturnValue('invalid json');

      const result = cacheService.get(key);

      expect(localStorageMock.getItem).toHaveBeenCalledWith(`cache_${key}`);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`cache_${key}`);
      expect(result).toBeNull();
    });

    it('should retrieve from memory cache if available', () => {
      const key = 'memory-cache-key';
      const value = { name: 'Memory Cache Value' };

      // Mock Date.now to return a fixed timestamp
      const now = 1625097600000; // 2021-07-01T00:00:00.000Z
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Set item in memory cache
      cacheService.set(key, value, 300, true);

      // Reset localStorage mock to verify it's not called
      vi.resetAllMocks();

      // Mock Date.now again after resetAllMocks
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Get item from cache
      const result = cacheService.get(key);

      // Should not check localStorage
      expect(localStorageMock.getItem).not.toHaveBeenCalled();

      // Should return the value from memory cache
      expect(result).toEqual(value);
    });
  });

  describe('has', () => {
    it('should return true when item exists and is not expired', () => {
      const key = 'existing-key';
      const value = { name: 'Test Value' };

      // Mock Date.now to return a fixed timestamp
      const now = 1625097600000; // 2021-07-01T00:00:00.000Z
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Set item in cache
      cacheService.set(key, value, 300);

      // Check if item exists
      const result = cacheService.has(key);

      expect(result).toBe(true);
    });

    it('should return false when item does not exist', () => {
      const key = 'non-existent-key';

      // Mock Date.now to return a fixed timestamp
      const now = 1625097600000; // 2021-07-01T00:00:00.000Z
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Check if item exists
      const result = cacheService.has(key);

      expect(result).toBe(false);
    });

    it('should return false when item is expired', () => {
      const key = 'expired-key';

      // Mock Date.now to return a fixed timestamp
      const now = 1625097600000; // 2021-07-01T00:00:00.000Z
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Setup localStorage.getItem to return an expired item
      vi.mocked(localStorageMock.getItem).mockReturnValue(JSON.stringify({
        value: { name: 'Expired Value' },
        expiry: now - 1000 // Expired 1 second ago
      }));

      // Check if item exists
      const result = cacheService.has(key);

      expect(result).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove item from localStorage and memory cache', () => {
      const key = 'key-to-remove';
      const value = { name: 'Test Value' };

      // Set item in both memory and localStorage
      cacheService.set(key, value);

      // Reset mocks
      vi.resetAllMocks();

      // Remove item
      cacheService.remove(key);

      // Should remove from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`cache_${key}`);

      // Should also remove from memory cache
      expect(cacheService.get(key)).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all cached items from localStorage and memory', () => {
      // Setup localStorage with some cached and non-cached items
      const mockItems = {
        'cache_item1': '{"value":"test1","expiry":123456789}',
        'cache_item2': '{"value":"test2","expiry":123456789}',
        'non_cache_item': 'should not be removed'
      };

      // Add items to mock store
      Object.entries(mockItems).forEach(([key, value]) => {
        localStorageMock.setItem(key, value);
      });

      // Add items to memory cache
      cacheService.set('item1', 'test1');
      cacheService.set('item2', 'test2');

      // Mock Object.keys to return our mock keys
      const originalObjectKeys = Object.keys;
      Object.keys = vi.fn().mockReturnValue(Object.keys(mockItems));

      // Clear cache
      cacheService.clear();

      // Verify only cache items were removed from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache_item1');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache_item2');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('non_cache_item');

      // Verify memory cache was cleared
      expect(cacheService.get('item1')).toBeNull();
      expect(cacheService.get('item2')).toBeNull();

      // Restore original Object.keys
      Object.keys = originalObjectKeys;
    });
  });

  describe('clearByPrefix', () => {
    it('should remove only items with the specified prefix from both localStorage and memory', () => {
      // Setup localStorage with various cached items
      const mockItems = {
        'cache_user_123': '{"value":"test1","expiry":123456789}',
        'cache_user_456': '{"value":"test2","expiry":123456789}',
        'cache_showcase_789': '{"value":"test3","expiry":123456789}'
      };

      // Add items to mock store
      Object.entries(mockItems).forEach(([key, value]) => {
        localStorageMock.setItem(key, value);
      });

      // Add items to memory cache
      cacheService.set('user_123', 'test1');
      cacheService.set('user_456', 'test2');
      cacheService.set('showcase_789', 'test3');

      // Mock Object.keys to return our mock keys
      const originalObjectKeys = Object.keys;
      Object.keys = vi.fn().mockReturnValue(Object.keys(mockItems));

      // Clear cache by prefix
      cacheService.clearByPrefix('user_');

      // Verify only user_ prefixed items were removed from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache_user_123');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache_user_456');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('cache_showcase_789');

      // Verify memory cache was cleared for user_ prefixed items only
      expect(cacheService.get('user_123')).toBeNull();
      expect(cacheService.get('user_456')).toBeNull();
      expect(cacheService.get('showcase_789')).not.toBeNull();

      // Restore original Object.keys
      Object.keys = originalObjectKeys;
    });
  });

  describe('clearUserCache', () => {
    it('should not clear anything when no token exists', () => {
      // Ensure no token in localStorage
      vi.mocked(localStorageMock.getItem).mockReturnValue(null);

      cacheService.clearUserCache();

      // No items should be removed
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('should clear only user-specific cache entries from both localStorage and memory', () => {
      const mockToken = 'token-12345678';

      // Setup localStorage with token and various cached items
      vi.mocked(localStorageMock.getItem).mockImplementation((key) => {
        if (key === 'authToken') return mockToken;
        return null;
      });

      // Mock Object.keys to return our mock keys
      const mockKeys = [
        'cache_user_12345678_summaries',
        'cache_user_12345678_stats',
        'cache_user_87654321_summaries', // Different user
        'cache_showcase_popular'
      ];

      const originalObjectKeys = Object.keys;
      Object.keys = vi.fn().mockReturnValue(mockKeys);

      // Add items to memory cache
      cacheService.set('user_12345678_summaries', 'test1');
      cacheService.set('user_12345678_stats', 'test2');
      cacheService.set('user_87654321_summaries', 'test3');
      cacheService.set('showcase_popular', 'test4');

      cacheService.clearUserCache();

      // Verify only current user's cache items were removed from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache_user_12345678_summaries');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache_user_12345678_stats');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('cache_user_87654321_summaries');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('cache_showcase_popular');

      // Verify memory cache was cleared for current user only
      expect(cacheService.get('user_12345678_summaries')).toBeNull();
      expect(cacheService.get('user_12345678_stats')).toBeNull();
      expect(cacheService.get('user_87654321_summaries')).not.toBeNull();
      expect(cacheService.get('showcase_popular')).not.toBeNull();

      // Restore original Object.keys
      Object.keys = originalObjectKeys;
    });
  });

  describe('prefetch', () => {
    it('should fetch and cache data when not already in cache', async () => {
      const key = 'prefetch-key';
      const value = { name: 'Prefetched Value' };
      const fetchFn = vi.fn().mockResolvedValue(value);

      // Mock has to return false (not in cache)
      vi.spyOn(cacheService, 'has').mockReturnValue(false);

      // Mock set to verify it's called
      const setSpy = vi.spyOn(cacheService, 'set');

      await cacheService.prefetch(key, fetchFn, 300);

      // Should check if item is in cache
      expect(cacheService.has).toHaveBeenCalledWith(key);

      // Should call fetch function
      expect(fetchFn).toHaveBeenCalled();

      // Should set item in cache
      expect(setSpy).toHaveBeenCalledWith(key, value, 300);
    });

    it('should not fetch data when already in cache', async () => {
      const key = 'already-cached-key';
      const fetchFn = vi.fn();

      // Mock has to return true (already in cache)
      vi.spyOn(cacheService, 'has').mockReturnValue(true);

      await cacheService.prefetch(key, fetchFn, 300);

      // Should check if item is in cache
      expect(cacheService.has).toHaveBeenCalledWith(key);

      // Should not call fetch function
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should handle fetch errors gracefully', async () => {
      const key = 'error-key';
      const fetchFn = vi.fn().mockRejectedValue(new Error('Fetch error'));

      // Mock has to return false (not in cache)
      vi.spyOn(cacheService, 'has').mockReturnValue(false);

      // Mock console.warn to verify it's called
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await cacheService.prefetch(key, fetchFn, 300);

      // Should check if item is in cache
      expect(cacheService.has).toHaveBeenCalledWith(key);

      // Should call fetch function
      expect(fetchFn).toHaveBeenCalled();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Prefetch failed for error-key'),
        expect.any(Error)
      );
    });
  });

  describe('getOrFetch', () => {
    it('should return cached data when available', async () => {
      const key = 'cached-key';
      const value = { name: 'Cached Value' };
      const fetchFn = vi.fn();

      // Mock get to return cached value
      vi.spyOn(cacheService, 'get').mockReturnValue(value);

      const result = await cacheService.getOrFetch(key, fetchFn, 300);

      // Should check cache
      expect(cacheService.get).toHaveBeenCalledWith(key);

      // Should not call fetch function
      expect(fetchFn).not.toHaveBeenCalled();

      // Should return cached value
      expect(result).toEqual(value);
    });

    it('should fetch and cache data when not in cache', async () => {
      const key = 'fetch-key';
      const value = { name: 'Fetched Value' };
      const fetchFn = vi.fn().mockResolvedValue(value);

      // Mock get to return null (not in cache)
      vi.spyOn(cacheService, 'get').mockReturnValue(null);

      // Mock set to verify it's called
      const setSpy = vi.spyOn(cacheService, 'set');

      const result = await cacheService.getOrFetch(key, fetchFn, 300);

      // Should check cache
      expect(cacheService.get).toHaveBeenCalledWith(key);

      // Should call fetch function
      expect(fetchFn).toHaveBeenCalled();

      // Should set item in cache
      expect(setSpy).toHaveBeenCalledWith(key, value, 300);

      // Should return fetched value
      expect(result).toEqual(value);
    });
  });
});
