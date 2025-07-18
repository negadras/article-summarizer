import {FC, useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {UserSummary} from "@/types/api";
import {ChevronRight} from "lucide-react";
import {userSummaryService} from "@/lib/userSummaryService";
import {useToast} from "@/hooks/use-toast";

/**
 * SavedSummaries component displays the user's bookmarked/saved summaries
 */
const SavedSummaries: FC = () => {
  const [savedSummaries, setSavedSummaries] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSavedSummaries = async () => {
      try {
        setIsLoading(true);
        const response = await userSummaryService.getUserSummaries({
          saved: true,
          page: 0,
          size: 3,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        setSavedSummaries(response.summaries);
        setError(null);
      } catch (err) {
        setError("Failed to load saved summaries");
        console.error("Error fetching saved summaries:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedSummaries();
  }, []);

  const handleViewSummary = (summaryId: string) => {
    window.location.href = `/summary/${summaryId}`;
  };

  const handleUnsaveSummary = async (summaryId: string) => {
    try {
      // Convert string ID to number if needed
      const numericId = parseInt(summaryId);
      if (isNaN(numericId)) {
        throw new Error("Invalid summary ID");
      }

      const success = await userSummaryService.toggleSavedStatus(numericId.toString(), false);

      if (success) {
        // Remove the summary from the list
        setSavedSummaries(prevSummaries =>
          prevSummaries.filter(summary => summary.id !== summaryId)
        );

        toast({
          title: "Summary Unsaved",
          description: "Summary removed from your saved items",
        });
      } else {
        throw new Error("Failed to unsave summary");
      }
    } catch (error) {
      console.error("Error unsaving summary:", error);
      toast({
        title: "Error",
        description: "Failed to unsave summary. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl" id="saved-summaries-heading">Saved Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse" data-testid="loading-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded"></div>
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
          <CardTitle className="text-xl" id="saved-summaries-heading">Saved Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <p>Unable to load saved summaries.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl" id="saved-summaries-heading">Saved Summaries</CardTitle>
      </CardHeader>
      <CardContent>
        {savedSummaries.length > 0 ? (
          <div
            className="space-y-4"
            role="list"
            aria-labelledby="saved-summaries-heading"
          >
            {savedSummaries.map((summary) => (
              <div key={summary.id} className="group relative" role="listitem">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2 font-normal hover:bg-primary/5 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  aria-label={`View summary: ${summary.title}`}
                  onClick={() => handleViewSummary(summary.id)}
                >
                  <div className="truncate flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {summary.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="sr-only">Summary length:</span> {summary.summaryWordCount} words
                      <span aria-hidden="true"> • </span>
                      <span className="sr-only">Compression ratio:</span> {summary.compressionRatio}% shorter
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Unsave summary: ${summary.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnsaveSummary(summary.id);
                  }}
                >
                  Unsave
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500" aria-live="polite">
            <p>No saved summaries yet.</p>
          </div>
        )}

        {savedSummaries.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="link"
              size="sm"
              aria-label="View all your saved summaries"
              onClick={() => window.location.href = "/summaries/saved"}
            >
              View All Saved
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedSummaries;
