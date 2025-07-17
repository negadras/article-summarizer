/**
 * Enhanced cache service for API responses
 * Implements a two-level caching strategy with memory and localStorage
 */

// Type definitions for cache items
interface CacheItem<T> {
  value: T;
  expiry: number;
}

// Memory cache for frequently accessed data
const memoryCache = new Map<string, CacheItem<any>>();

// Configuration
const DEFAULT_TTL = 300; // 5 minutes
const MEMORY_CACHE_TTL = 60; // 1 minute (shorter than localStorage)
const MAX_MEMORY_CACHE_SIZE = 100; // Maximum number of items in memory cache

export const cacheService = {
  /**
   * Set an item in both memory and localStorage caches
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - Time to live in seconds (default: 5 minutes)
   * @param memoryOnly - Whether to store only in memory (default: false)
   */
  set: (key: string, value: any, ttlSeconds: number = DEFAULT_TTL, memoryOnly: boolean = false) => {
    const now = Date.now();
    const item: CacheItem<any> = {
      value,
      expiry: now + (ttlSeconds * 1000)
    };
    
    // Always store in memory cache (with shorter TTL for memory)
    const memoryCacheItem: CacheItem<any> = {
      value,
      expiry: now + (Math.min(ttlSeconds, MEMORY_CACHE_TTL) * 1000)
    };
    memoryCache.set(`cache_${key}`, memoryCacheItem);
    
    // Ensure memory cache doesn't grow too large
    if (memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
      // Remove oldest item (first item in the map)
      const firstKey = memoryCache.keys().next().value;
      memoryCache.delete(firstKey);
    }
    
    // Store in localStorage unless memoryOnly is true
    if (!memoryOnly) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(item));
      } catch (error) {
        // Handle localStorage errors (e.g., quota exceeded)
        console.warn('localStorage cache error:', error);
        // Continue with memory cache only
      }
    }
  },

  /**
   * Get an item from cache (checks memory first, then localStorage)
   * @param key - Cache key
   * @returns The cached value or null if not found or expired
   */
  get: (key: string): any | null => {
    const now = Date.now();
    const cacheKey = `cache_${key}`;
    
    // Try memory cache first (faster)
    if (memoryCache.has(cacheKey)) {
      const item = memoryCache.get(cacheKey);
      
      // Check if expired
      if (now > item!.expiry) {
        memoryCache.delete(cacheKey);
      } else {
        return item!.value;
      }
    }
    
    // Fall back to localStorage
    const itemStr = localStorage.getItem(cacheKey);
    
    // Return null if item doesn't exist
    if (!itemStr) {
      return null;
    }
    
    try {
      const item: CacheItem<any> = JSON.parse(itemStr);
      
      // Return null if expired
      if (now > item.expiry) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      // Store back in memory cache for faster subsequent access
      memoryCache.set(cacheKey, {
        value: item.value,
        expiry: Math.min(item.expiry, now + (MEMORY_CACHE_TTL * 1000))
      });
      
      return item.value;
    } catch (error) {
      // If parsing fails, remove the item and return null
      localStorage.removeItem(cacheKey);
      return null;
    }
  },

  /**
   * Check if an item exists in cache and is not expired
   * @param key - Cache key
   * @returns True if item exists and is valid, false otherwise
   */
  has: (key: string): boolean => {
    const now = Date.now();
    const cacheKey = `cache_${key}`;
    
    // Check memory cache first
    if (memoryCache.has(cacheKey)) {
      const item = memoryCache.get(cacheKey);
      if (now <= item!.expiry) {
        return true;
      }
    }
    
    // Check localStorage
    const itemStr = localStorage.getItem(cacheKey);
    if (!itemStr) {
      return false;
    }
    
    try {
      const item: CacheItem<any> = JSON.parse(itemStr);
      return now <= item.expiry;
    } catch {
      return false;
    }
  },

  /**
   * Remove an item from both memory and localStorage caches
   * @param key - Cache key
   */
  remove: (key: string) => {
    const cacheKey = `cache_${key}`;
    memoryCache.delete(cacheKey);
    localStorage.removeItem(cacheKey);
  },

  /**
   * Clear all cached items from both memory and localStorage
   */
  clear: () => {
    // Clear memory cache
    memoryCache.clear();
    
    // Clear localStorage cache
    Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .forEach(key => localStorage.removeItem(key));
  },

  /**
   * Clear all cached items with a specific prefix
   * @param prefix - Cache key prefix
   */
  clearByPrefix: (prefix: string) => {
    const cachePrefix = `cache_${prefix}`;
    
    // Clear from memory cache
    for (const key of memoryCache.keys()) {
      if (key.startsWith(cachePrefix)) {
        memoryCache.delete(key);
      }
    }
    
    // Clear from localStorage
    Object.keys(localStorage)
      .filter(key => key.startsWith(cachePrefix))
      .forEach(key => localStorage.removeItem(key));
  },

  /**
   * Clear all user-related cached items
   * This is useful when user data changes (e.g., after creating a new summary)
   */
  clearUserCache: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    // Get user identifier from token (last 8 chars as a simple "hash")
    const tokenHash = token.substring(token.length - 8);
    const userPrefix = `cache_user_${tokenHash}`;
    
    // Clear from memory cache
    for (const key of memoryCache.keys()) {
      if (key.startsWith(userPrefix)) {
        memoryCache.delete(key);
      }
    }
    
    // Clear from localStorage
    Object.keys(localStorage)
      .filter(key => key.startsWith(userPrefix))
      .forEach(key => localStorage.removeItem(key));
  },

  /**
   * Prefetch data into cache
   * @param key - Cache key
   * @param fetchFn - Function that returns a Promise with the data to cache
   * @param ttlSeconds - Time to live in seconds
   */
  prefetch: async (key: string, fetchFn: () => Promise<any>, ttlSeconds: number = DEFAULT_TTL): Promise<void> => {
    try {
      // Only prefetch if not already in cache
      if (!cacheService.has(key)) {
        const data = await fetchFn();
        cacheService.set(key, data, ttlSeconds);
      }
    } catch (error) {
      console.warn(`Prefetch failed for ${key}:`, error);
      // Prefetch failures are non-critical, so we just log and continue
    }
  },

  /**
   * Get data with automatic fetching if not in cache
   * @param key - Cache key
   * @param fetchFn - Function that returns a Promise with the data
   * @param ttlSeconds - Time to live in seconds
   * @returns The cached or freshly fetched data
   */
  getOrFetch: async <T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = DEFAULT_TTL): Promise<T> => {
    // Try to get from cache first
    const cachedData = cacheService.get(key);
    if (cachedData !== null) {
      return cachedData as T;
    }
    
    // If not in cache, fetch it
    const data = await fetchFn();
    cacheService.set(key, data, ttlSeconds);
    return data;
  }
};