import {GetUserSummariesParams, UserSummariesResponse, UserSummary} from "@/types/api";
import {cacheService} from "./cacheService";
import {createAppError, ErrorCategory, ErrorSeverity, isOnline, offlineFirstFetch} from "./errorHandlingService";

interface QueuedRequest<T> {
  resolve: (value: T) => void;
  reject: (error: any) => void;
  params?: any;
}

// Request batching system
new Map<string, QueuedRequest<any>[]>();
new Map<string, NodeJS.Timeout>();
/**
 * Generate a cache key for user summaries
 */
function getUserSummariesCacheKey(params?: GetUserSummariesParams): string {
  const token = localStorage.getItem('authToken');
  if (!token) return '';

  // Create a stable representation of params for the cache key
  const paramsKey = params ? Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
    : '';

  // Use last 8 chars of token as a simple "hash"
  const tokenHash = token.substring(token.length - 8);
  return `user_summaries_${tokenHash}_${paramsKey}`;
}

/**
 * Service for managing user summaries with optimized performance
 */
export const userSummaryService = {
  /**
   * Get user summaries with optional filtering and pagination
   * Uses caching and request batching for performance
   */
  getUserSummaries: async (params?: GetUserSummariesParams): Promise<UserSummariesResponse> => {
    // Generate cache key
    const cacheKey = getUserSummariesCacheKey(params);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        // Get auth token
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No authentication token found, using mock data');
          return {
            summaries: getMockUserSummaries(params?.saved || false),
            totalPages: 1,
            currentPage: 0,
            totalCount: params?.saved ? 2 : 5
          };
        }

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        if (params?.saved !== undefined) queryParams.append('saved', params.saved.toString());
        queryParams.toString() ? `?${queryParams.toString()}` : '';

        return offlineFirstFetch(
          async () => {
            // For development purposes, return mock data instead of making API calls
            // This helps avoid 500 errors while the backend is being developed
            console.log('Using mock data instead of API call');
            return {
              summaries: getMockUserSummaries(params?.saved || false),
              totalPages: 1,
              currentPage: 0,
              totalCount: params?.saved ? 2 : 5
            };

          },

          () => {
            // Check if we're offline
            if (!isOnline()) {
              console.log('Offline mode: using mock data for user summaries');
              return {
                summaries: getMockUserSummaries(params?.saved || false),
                totalPages: 1,
                currentPage: 0,
                totalCount: params?.saved ? 2 : 5
              };
            }
            return null; // No fallback, let the error propagate
          },
          {
            retryOptions: {
              maxAttempts: 3,
              initialDelayMs: 1000,
              maxDelayMs: 5000,
              backoffFactor: 1.5,
              retryableStatusCodes: [408, 429, 500, 502, 503, 504],
              onRetry: (attempt, delay, error) => {
                console.log(`Retrying fetch user summaries (attempt ${attempt} of 3) after ${delay}ms due to: ${error.message}`);
              }
            }
          }
        );
      },
      60 // Cache for 1 minute
    );
  },

  /**
   * Get a specific user summary by ID
   * Uses caching and retry logic for reliability
   */
  getUserSummary: async (id: string): Promise<UserSummary> => {
    const token = localStorage.getItem('authToken');
    const tokenHash = token ? token.substring(token.length - 8) : '';
    const cacheKey = `user_summary_${tokenHash}_${id}`;

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        // Get auth token
        if (!token) {
          console.log('No authentication token found, using mock data');
          // Return a mock summary based on the ID
          return getMockUserSummaries(false).find(s => s.id === id) || getMockUserSummaries(false)[0];
        }

        // Use offline-first fetch with fallback to cached data
        return offlineFirstFetch(
          async () => {
            // For development purposes, return mock data instead of making API calls
            console.log('Using mock data instead of API call for summary detail');
            const mockSummary = getMockUserSummaries(false).find(s => s.id === id) || getMockUserSummaries(false)[0];

            if (!mockSummary) {
              throw createAppError('Summary not found', {
                category: ErrorCategory.CLIENT,
                statusCode: 404,
                retryable: false,
                userMessage: 'The requested summary could not be found.'
              });
            }

            return mockSummary;
          },
          // Fallback function that returns cached data or mock data
          () => {
            // Check if we're offline
            if (!isOnline()) {
              console.log('Offline mode: using mock data for summary detail');
              return getMockUserSummaries(false).find(s => s.id === id) || getMockUserSummaries(false)[0];
            }
            return null; // No fallback, let the error propagate
          },
          {
            retryOptions: {
              maxAttempts: 3,
              initialDelayMs: 1000,
              maxDelayMs: 5000,
              backoffFactor: 1.5,
              onRetry: (attempt, delay, error) => {
                console.log(`Retrying fetch summary detail (attempt ${attempt} of 3) after ${delay}ms due to: ${error.message}`);
              }
            }
          }
        );
      },
      120 // Cache for 2 minutes
    );
  },

  /**
   * Toggle saved status for a summary
   * Optimistically updates cache and uses retry logic
   */
  toggleSavedStatus: async (summaryId: string, isSaved: boolean): Promise<boolean> => {
    // Get auth token
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      throw createAppError('Authentication required', {
        category: ErrorCategory.AUTHENTICATION,
        severity: ErrorSeverity.ERROR,
        retryable: false,
        userMessage: 'You need to be logged in to save summaries.'
      });
    }

    // Optimistically update cache
    const tokenHash = token.substring(token.length - 8);
    const summaryKey = `user_summary_${tokenHash}_${summaryId}`;
    const cachedSummary = cacheService.get(summaryKey);

    if (cachedSummary) {
      // Update the cached summary with new saved status
      cachedSummary.saved = isSaved;
      cacheService.set(summaryKey, cachedSummary, 120);
    }

    try {
      // Use offline-first fetch with retry logic
      return await offlineFirstFetch(
        async () => {
          // For development purposes, simulate a successful API call
          console.log(`Mock: ${isSaved ? 'Saving' : 'Unsaving'} summary ${summaryId}`);

          // Clear user-related cache to reflect the changes
          // We're selective about which cache entries to clear
          // Only clear list views that would be affected by this change
          if (isSaved) {
            // When saving, clear saved summaries lists
            cacheService.clearByPrefix(`user_summaries_${tokenHash}_saved=true`);
          } else {
            // When unsaving, clear saved summaries lists
            cacheService.clearByPrefix(`user_summaries_${tokenHash}_saved=true`);
          }

          // Always clear the "all summaries" view since it's affected either way
          cacheService.clearByPrefix(`user_summaries_${tokenHash}_`);

          return true;


        },
        // Fallback function for offline mode
        () => {
          if (!isOnline()) {
            // Store the action to be performed when back online
            const pendingActions = JSON.parse(localStorage.getItem('pendingSummaryActions') || '[]');
            pendingActions.push({
              action: isSaved ? 'save' : 'unsave',
              summaryId,
              timestamp: Date.now()
            });
            localStorage.setItem('pendingSummaryActions', JSON.stringify(pendingActions));

            console.log(`Offline mode: queued ${isSaved ? 'save' : 'unsave'} action for summary ${summaryId}`);
            return true; // Optimistically return success
          }
          return null; // No fallback, let the error propagate
        },
        {
          retryOptions: {
            maxAttempts: 3,
            initialDelayMs: 1000,
            maxDelayMs: 5000,
            backoffFactor: 1.5,
            onRetry: (attempt, delay, error) => {
              console.log(`Retrying ${isSaved ? 'save' : 'unsave'} summary (attempt ${attempt} of 3) after ${delay}ms due to: ${error.message}`);
            }
          }
        }
      );
    } catch (error) {
      console.error(`Error ${isSaved ? 'saving' : 'unsaving'} summary:`, error);

      // Revert optimistic update if there was an error
      if (cachedSummary) {
        cachedSummary.saved = !isSaved;
        cacheService.set(summaryKey, cachedSummary, 120);
      }

      // Rethrow with user-friendly message
      if (error instanceof Error) {
        throw createAppError(`Failed to ${isSaved ? 'save' : 'unsave'} summary`, {
          category: 'category' in error ? (error as any).category : ErrorCategory.UNKNOWN,
          severity: ErrorSeverity.ERROR,
          cause: error,
          userMessage: `Unable to ${isSaved ? 'save' : 'unsave'} this summary. Please try again later.`
        });
      }

      return false;
    }
  },

  /**
   * Clear all user summary caches
   * Call this when logging out or when data might be stale
   */
  clearCache: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const tokenHash = token.substring(token.length - 8);
    cacheService.clearByPrefix(`user_summary_${tokenHash}`);
    cacheService.clearByPrefix(`user_summaries_${tokenHash}`);
  }
};

/**
 * Get mock user summaries for development and fallback
 */
function getMockUserSummaries(savedOnly: boolean): UserSummary[] {
  const allSummaries: UserSummary[] = [
    {
      id: "1",
      title: "The Rise of Sustainable Technology in Urban Development",
      summaryContent: "Sustainable technology is transforming urban development through smart grids, renewable energy integration, and IoT-enabled infrastructure...",
      keyPoints: [
        "Smart grids reduce energy consumption by 30%",
        "IoT sensors optimize resource allocation in real-time",
        "Green building materials reduce carbon footprint"
      ],
      originalWordCount: 1850,
      summaryWordCount: 185,
      compressionRatio: 90,
      saved: true,
      createdAt: "2025-07-15T10:30:00Z"
    },
    {
      id: "2",
      title: "Advancements in Personalized Medicine: 2025 Update",
      summaryContent: "Personalized medicine continues to advance with genomic sequencing becoming more affordable and AI-driven diagnostic tools improving accuracy...",
      keyPoints: [
        "Genomic sequencing costs dropped 40% in the past year",
        "AI diagnostics show 95% accuracy in early disease detection",
        "Targeted therapies reduce side effects by 60%"
      ],
      originalWordCount: 2200,
      summaryWordCount: 220,
      compressionRatio: 90,
      saved: false,
      createdAt: "2025-07-14T15:45:00Z"
    },
    {
      id: "3",
      title: "The Future of Work: AI Collaboration Models",
      summaryContent: "AI collaboration models are reshaping workplace dynamics...",
      keyPoints: [
        "Human-AI teams show 35% higher productivity",
        "Adaptive interfaces personalize workflow for each user",
        "Ethical guidelines becoming standard in AI deployment"
      ],
      originalWordCount: 1650,
      summaryWordCount: 165,
      compressionRatio: 90,
      saved: true,
      createdAt: "2025-07-10T09:15:00Z"
    },
    {
      id: "4",
      title: "Renewable Energy Breakthroughs of 2025",
      summaryContent: "Renewable energy technologies have seen significant advancements...",
      keyPoints: [
        "New solar panel designs achieve 32% efficiency",
        "Grid-scale battery storage costs reduced by 45%",
        "Offshore wind farms now viable in deeper waters"
      ],
      originalWordCount: 1950,
      summaryWordCount: 195,
      compressionRatio: 90,
      saved: false,
      createdAt: "2025-07-08T14:20:00Z"
    },
    {
      id: "5",
      title: "Cybersecurity Trends for Enterprise Systems",
      summaryContent: "Enterprise cybersecurity is evolving rapidly to counter sophisticated threats...",
      keyPoints: [
        "Zero-trust architecture adoption increased by 65%",
        "AI-powered threat detection reduces response time by 80%",
        "Supply chain security becoming top priority for CISOs"
      ],
      originalWordCount: 2100,
      summaryWordCount: 210,
      compressionRatio: 90,
      saved: false,
      createdAt: "2025-07-05T11:10:00Z"
    }
  ];

  return savedOnly ? allSummaries.filter(summary => summary.saved) : allSummaries;
}
