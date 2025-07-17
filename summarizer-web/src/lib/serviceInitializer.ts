import {userSummaryService} from './userSummaryService';
import {userStatsService} from './userStatsService';
import {showcaseService} from './showcaseService';
import {isOnline, withRetry} from './errorHandlingService';

/**
 * Service initializer to optimize application performance
 * This module handles prefetching common data and setting up performance optimizations
 */
export const serviceInitializer = {
  /**
   * Initialize services for authenticated users
   * Call this when a user logs in or when the app starts with an authenticated user
   */
  initAuthenticatedUser: async (): Promise<void> => {
    try {
      // Skip prefetching if offline
      if (!isOnline()) {
        console.log('Offline mode: skipping authenticated user service initialization');
        return;
      }

      // Use Promise.allSettled to continue even if some prefetches fail
      const results = await Promise.allSettled([
        // Prefetch user summaries for common views with retry
        withRetry(
          () => userSummaryService.prefetchCommonViews(),
          { maxAttempts: 2, initialDelayMs: 500 }
        ),

        // Prefetch user stats with retry
        withRetry(
          () => userStatsService.prefetchStats(),
          { maxAttempts: 2, initialDelayMs: 500 }
        )
      ]);

      // Log any failures but don't throw errors (non-critical)
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const services = ['userSummaryService', 'userStatsService'];
          console.warn(`Error initializing ${services[index]}:`, result.reason);
        }
      });

      console.log('Authenticated user services initialized');
    } catch (error) {
      console.warn('Error initializing authenticated user services:', error);
      // Non-critical, so we just log and continue
    }
  },

  /**
   * Initialize services for public users
   * Call this when the app starts for non-authenticated users
   */
  initPublicUser: async (): Promise<void> => {
    try {
      // Skip prefetching if offline
      if (!isOnline()) {
        console.log('Offline mode: skipping public user service initialization');
        return;
      }

      // Prefetch showcase summaries with retry
      await withRetry(
        () => showcaseService.prefetchShowcase(),
        { maxAttempts: 2, initialDelayMs: 500 }
      );

      console.log('Public user services initialized');
    } catch (error) {
      console.warn('Error initializing public user services:', error);
      // Non-critical, so we just log and continue
    }
  },

  /**
   * Initialize all services based on authentication status
   * Call this when the app starts
   */
  initAll: async (): Promise<void> => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');

      if (token) {
        // Initialize authenticated user services
        await serviceInitializer.initAuthenticatedUser();
      } else {
        // Initialize public user services
        await serviceInitializer.initPublicUser();
      }

      // Process any pending offline actions if we're online now
      if (isOnline()) {
        await serviceInitializer.processPendingOfflineActions();
      }

      // Set up online event listener to process pending actions when connection is restored
      window.addEventListener('online', serviceInitializer.processPendingOfflineActions);
    } catch (error) {
      console.warn('Error initializing services:', error);
      // Non-critical, so we just log and continue
    }
  },

  /**
   * Process any actions that were queued while offline
   */
  processPendingOfflineActions: async (): Promise<void> => {
    try {
      // Check for pending summary actions
      const pendingActionsStr = localStorage.getItem('pendingSummaryActions');
      if (!pendingActionsStr) return;

      const pendingActions = JSON.parse(pendingActionsStr);
      if (!Array.isArray(pendingActions) || pendingActions.length === 0) return;

      console.log(`Processing ${pendingActions.length} pending offline actions`);

      // Process each action
      for (const action of pendingActions) {
        try {
          if (action.action === 'save') {
            await userSummaryService.toggleSavedStatus(action.summaryId, true);
          } else if (action.action === 'unsave') {
            await userSummaryService.toggleSavedStatus(action.summaryId, false);
          }
        } catch (actionError) {
          console.error(`Failed to process offline action: ${action.action} for summary ${action.summaryId}`, actionError);
          // Continue with other actions even if one fails
        }
      }

      // Clear processed actions
      localStorage.removeItem('pendingSummaryActions');
    } catch (error) {
      console.error('Error processing pending offline actions:', error);
    }
  },

  /**
   * Clear all caches
   * Call this when logging out
   */
  clearAllCaches: (): void => {
    userSummaryService.clearCache();
    userStatsService.clearCache();
    showcaseService.clearCache();
  },

  /**
   * Clean up event listeners
   * Call this when the app is unmounted
   */
  cleanup: (): void => {
    window.removeEventListener('online', serviceInitializer.processPendingOfflineActions);
  }
};
