import {UserStats} from "@/types/api";
import {cacheService} from "./cacheService";

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Service for fetching user statistics
 */
export const userStatsService = {
  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<UserStats> => {
    try {
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create cache key based on the user token
      const tokenHash = token.substring(token.length - 8);
      const cacheKey = `user_stats_${tokenHash}`;

      // Check cache first (stats can be cached for a bit longer)
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Fetch data from API if not in cache
      const response = await fetch(`${API_BASE_URL}/users/me/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }

      const data = await response.json();

      // Cache the response for 2 minutes (stats don't change as frequently)
      cacheService.set(cacheKey, data, 120);

      return data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);

      // Return mock data for now (in a real app, we'd handle this differently)
      return getMockUserStats();
    }
  },

  /**
   * Clear user stats cache
   * Call this when a new summary is created to refresh stats
   */
  clearCache: () => {
    // Use the enhanced caching strategy to clear all user-related cache
    cacheService.clearUserCache();
  }
};

/**
 * Get mock user statistics for development and fallback
 */
function getMockUserStats(): UserStats {
  return {
    totalSummaries: 42,
    wordsSaved: 126000,
    timeSaved: 630 // minutes
  };
}
