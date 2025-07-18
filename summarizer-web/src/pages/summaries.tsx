import {useEffect, useState} from "react";
import {useLocation, useRoute} from "wouter";
import {useAuth} from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Bookmark, BookmarkCheck, Calendar, ChevronLeft, ChevronRight} from "lucide-react";
import {UserSummary} from "@/types/api";
import {userSummaryService} from "@/lib/userSummaryService";
import {useToast} from "@/hooks/use-toast";

export default function SummariesPage() {
  const [, params] = useRoute("/summaries/:tab");
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "saved">(
    params?.tab === "saved" ? "saved" : "all"
  );
  const [summaries, setSummaries] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const pageSize = 10;

  useEffect(() => {
    // Update URL when tab changes
    setLocation(`/summaries/${activeTab}`, { replace: true });
  }, [activeTab, setLocation]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setLocation("/auth");
      return;
    }

    const fetchSummaries = async () => {
      try {
        setIsLoading(true);
        const response = await userSummaryService.getUserSummaries({
          page: currentPage,
          size: pageSize,
          saved: activeTab === "saved",
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        setSummaries(response.summaries);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
        setError(null);
      } catch (err) {
        setError("Failed to load summaries");
        console.error("Error fetching summaries:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaries();
  }, [isAuthenticated, authLoading, activeTab, currentPage, setLocation]);

  const handleToggleSaved = async (summaryId: string, currentSavedStatus: boolean) => {
    try {
      // Convert string ID to number if needed
      const numericId = parseInt(summaryId);
      if (isNaN(numericId)) {
        throw new Error("Invalid summary ID");
      }

      const success = await userSummaryService.toggleSavedStatus(numericId.toString(), !currentSavedStatus);

      if (success) {
        // Update local state to reflect the change
        setSummaries(prevSummaries =>
          prevSummaries.map(summary =>
            summary.id === summaryId
              ? { ...summary, saved: !currentSavedStatus }
              : summary
          )
        );

        // If we're on the saved tab and unsaving a summary, remove it from the list
        if (activeTab === "saved" && currentSavedStatus) {
          setSummaries(prevSummaries =>
            prevSummaries.filter(summary => summary.id !== summaryId)
          );
          setTotalCount(prev => prev - 1);
        }

        toast({
          title: currentSavedStatus ? "Summary Unsaved" : "Summary Saved",
          description: currentSavedStatus
            ? "Summary removed from your saved items"
            : "Summary added to your saved items",
        });
      } else {
        throw new Error("Failed to update saved status");
      }
    } catch (error) {
      console.error("Error toggling saved status:", error);
      toast({
        title: "Error",
        description: "Failed to update saved status. Please try again.",
        variant: "destructive",
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

  const handleViewSummary = (summaryId: string) => {
    setLocation(`/summary/${summaryId}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Render loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => setLocation("/")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">My Summaries</h1>
          <p className="text-gray-600 mt-1">View and manage all your article summaries</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "saved")}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="px-6">All Summaries</TabsTrigger>
            <TabsTrigger value="saved" className="px-6">Saved Summaries</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex justify-between items-center">
                  <span>All Summaries</span>
                  <span className="text-sm font-normal text-gray-500">
                    {totalCount} {totalCount === 1 ? 'summary' : 'summaries'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-6 animate-pulse">
                    {Array.from({ length: 5 }).map((_, i) => (
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
                ) : error ? (
                  <div className="text-center py-8 text-gray-500" aria-live="polite">
                    <p>Unable to load summaries at this time.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setCurrentPage(0)}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : summaries.length > 0 ? (
                  <>
                    <div className="space-y-6" role="feed">
                      {summaries.map((summary) => (
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
                              onClick={() => handleViewSummary(summary.id)}
                              aria-label={`View full summary of ${summary.title}`}
                            >
                              View Full Summary
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-2 mt-8">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 0}
                          onClick={() => handlePageChange(currentPage - 1)}
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <span className="text-sm text-gray-600">
                          Page {currentPage + 1} of {totalPages}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages - 1}
                          onClick={() => handlePageChange(currentPage + 1)}
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500" aria-live="polite">
                    <p>You haven't created any summaries yet.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setLocation("/")}
                    >
                      Create Your First Summary
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex justify-between items-center">
                  <span>Saved Summaries</span>
                  <span className="text-sm font-normal text-gray-500">
                    {totalCount} {totalCount === 1 ? 'summary' : 'summaries'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-6 animate-pulse">
                    {Array.from({ length: 5 }).map((_, i) => (
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
                ) : error ? (
                  <div className="text-center py-8 text-gray-500" aria-live="polite">
                    <p>Unable to load saved summaries at this time.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setCurrentPage(0)}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : summaries.length > 0 ? (
                  <>
                    <div className="space-y-6" role="feed">
                      {summaries.map((summary) => (
                        <div key={summary.id} className="border-b pb-6 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{summary.title}</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggleSaved(summary.id, summary.saved)}
                              aria-label="Remove from saved summaries"
                              aria-pressed={true}
                            >
                              <BookmarkCheck className="h-4 w-4 text-primary" aria-hidden="true" />
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
                              onClick={() => handleViewSummary(summary.id)}
                              aria-label={`View full summary of ${summary.title}`}
                            >
                              View Full Summary
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-2 mt-8">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 0}
                          onClick={() => handlePageChange(currentPage - 1)}
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <span className="text-sm text-gray-600">
                          Page {currentPage + 1} of {totalPages}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages - 1}
                          onClick={() => handlePageChange(currentPage + 1)}
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500" aria-live="polite">
                    <p>You don't have any saved summaries yet.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab("all")}
                    >
                      Browse All Summaries
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
