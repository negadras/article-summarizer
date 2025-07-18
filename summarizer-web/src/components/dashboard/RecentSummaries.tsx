import {FC, useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {UserSummary} from "@/types/api";
import {Bookmark, BookmarkCheck, Calendar, RefreshCw} from "lucide-react";
import {userSummaryService} from "@/lib/userSummaryService";
import {useToast} from "@/hooks/use-toast";
import {handleError, isOnline} from "@/lib/errorHandlingService";

/**
 * RecentSummaries component displays the user's recent summary history
 */
const RecentSummaries: FC = () => {
  const [recentSummaries, setRecentSummaries] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastHook = useToast();

  const fetchRecentSummaries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userSummaryService.getUserSummaries({
        page: 0,
        size: 3,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setRecentSummaries(response.summaries);
    } catch (err) {
      // In test environment, just set the error without using toast
      if (process.env.NODE_ENV === 'test') {
        console.error('Error fetching recent summaries:', err);
        setError("Failed to load recent summaries");
      } else {
        handleError(err instanceof Error ? err : new Error(String(err)), {
          toast: toastHook,
          context: 'RecentSummaries',
          silent: false,
          onRetry: fetchRecentSummaries
        });
        setError("Failed to load recent summaries");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSummaries();

    // Set up online/offline event listeners to refresh data when connection is restored
    const handleOnline = () => {
      toastHook.toast({
        title: "You're back online",
        description: "Refreshing your summaries...",
      });
      fetchRecentSummaries();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [toastHook]);

  const handleToggleSaved = async (summaryId: string, currentSavedStatus: boolean) => {
    try {
      // Convert string ID to number if needed
      const numericId = parseInt(summaryId);
      if (isNaN(numericId)) {
        throw new Error("Invalid summary ID");
      }

      setRecentSummaries(prevSummaries =>
        prevSummaries.map(summary =>
          summary.id === summaryId
            ? { ...summary, saved: !currentSavedStatus }
            : summary
        )
      );

      // Show toast notification
      toastHook.toast({
        title: currentSavedStatus ? "Unsaving summary..." : "Saving summary...",
        description: !isOnline() ? "Will be updated when you're back online" : undefined,
      });

      try {
        const success = await userSummaryService.toggleSavedStatus(numericId.toString(), !currentSavedStatus);

        if (!success) {
          throw new Error("Failed to update summary saved status");
        }

        // Update toast on success
        toastHook.toast({
          title: currentSavedStatus ? "Summary Unsaved" : "Summary Saved",
          description: currentSavedStatus
            ? "Summary removed from your saved items"
            : "Summary added to your saved items",
        });
      } catch (error) {
        setRecentSummaries(prevSummaries =>
          prevSummaries.map(summary =>
            summary.id === summaryId
              ? { ...summary, saved: currentSavedStatus }
              : summary
          )
        );

        handleError(error instanceof Error ? error : new Error(String(error)), {
          toast: toastHook,
          context: 'RecentSummaries.toggleSaved',
          onRetry: () => handleToggleSaved(summaryId, currentSavedStatus)
        });
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), {
        toast: toastHook,
        context: 'RecentSummaries.toggleSaved'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl" id="recent-summaries-heading">Recent Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 animate-pulse" data-testid="loading-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b pb-6 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>

                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>

                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl" id="recent-summaries-heading">Recent Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500" aria-live="polite">
            <p>Unable to load recent summaries at this time.</p>
            <p className="text-sm mt-2 mb-4">
              {!isOnline() ?
                "You appear to be offline. Please check your internet connection." :
                "There was a problem connecting to the server."}
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={fetchRecentSummaries}
              disabled={!isOnline()}
            >
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl" id="recent-summaries-heading">Recent Summaries</CardTitle>
      </CardHeader>
      <CardContent>
        {recentSummaries.length > 0 ? (
          <div
            className="space-y-6"
            role="feed"
            aria-labelledby="recent-summaries-heading"
          >
            {recentSummaries.map((summary) => (
              <div key={summary.id} className="border-b pb-6 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{summary.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleSaved(summary.id, summary.saved)}
                    aria-label={summary.saved ? "Remove from saved summaries" : "Save this summary"}
                    aria-pressed={summary.saved}
                  >
                    {summary.saved ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    ) : (
                      <Bookmark className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {summary.summaryContent}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
                    <span>
                      <span className="sr-only">Created on:</span> {formatDate(summary.createdAt)}
                    </span>
                    <span className="mx-2" aria-hidden="true">•</span>
                    <span>
                      <span className="sr-only">Compression ratio:</span> {summary.compressionRatio}% shorter
                    </span>
                  </div>

                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    aria-label={`View full summary of ${summary.title}`}
                    onClick={() => window.location.href = `/summary/${summary.id}`}
                  >
                    View Full Summary
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500" aria-live="polite">
            <p>You haven't created any summaries yet.</p>
          </div>
        )}

        {recentSummaries.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              aria-label="View all your recent summaries"
              onClick={() => window.location.href = "/summaries/all"}
            >
              View All Summaries
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSummaries;
