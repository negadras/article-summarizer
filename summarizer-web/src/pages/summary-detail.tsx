import {useEffect, useState} from "react";
import {useLocation, useRoute} from "wouter";
import {useAuth} from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {UserSummary} from "@/types/api";
import {userSummaryService} from "@/lib/userSummaryService";
import {useToast} from "@/hooks/use-toast";
import {BarChart2, Bookmark, BookmarkCheck, Calendar, ChevronLeft, Clock, Copy, Download, Share2} from "lucide-react";

export default function SummaryDetailPage() {
  const [, params] = useRoute("/summary/:id");
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setLocation("/auth");
      return;
    }

    if (!params?.id) {
      setError("Summary ID is missing");
      setIsLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const data = await userSummaryService.getUserSummary(params.id);
        setSummary(data);
        setError(null);
      } catch (err) {
        setError("Failed to load summary");
        console.error("Error fetching summary:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [isAuthenticated, authLoading, params?.id, setLocation]);

  const handleToggleSaved = async () => {
    if (!summary) return;

    try {
      // Convert string ID to number if needed
      const numericId = parseInt(summary.id);
      if (isNaN(numericId)) {
        throw new Error("Invalid summary ID");
      }

      const success = await userSummaryService.toggleSavedStatus(numericId.toString(), !summary.saved);

      if (success) {
        // Update local state to reflect the change
        setSummary(prevSummary =>
          prevSummary ? { ...prevSummary, saved: !prevSummary.saved } : null
        );

        toast({
          title: summary.saved ? "Summary Unsaved" : "Summary Saved",
          description: summary.saved
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

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleExport = () => {
    if (!summary) return;

    const exportData = {
      title: summary.title,
      summaryContent: summary.summaryContent,
      keyPoints: summary.keyPoints,
      stats: {
        originalWords: summary.originalWordCount,
        summaryWords: summary.summaryWordCount,
        compressionRatio: `${summary.compressionRatio}%`
      },
      createdAt: summary.createdAt
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-summary.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render loading state while authentication is being checked
  if (authLoading || isLoading) {
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => setLocation("/summaries/all")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Summaries
          </Button>
        </div>

        {error || !summary ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {error || "Summary not found"}
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn't find the summary you're looking for. It may have been deleted or you may not have permission to view it.
              </p>
              <Button
                onClick={() => setLocation("/summaries/all")}
              >
                View All Summaries
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{summary.title}</h1>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Created on {formatDate(summary.createdAt)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleToggleSaved}
                          title={summary.saved ? "Remove from saved" : "Save summary"}
                        >
                          {summary.saved ? (
                            <BookmarkCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(summary.summaryContent, "Summary")}
                          title="Copy summary"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleExport}
                          title="Export summary"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-800 leading-relaxed mb-8">
                        {summary.summaryContent}
                      </p>

                      {summary.keyPoints.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h3 className="font-medium text-gray-900 mb-3">Key Takeaways:</h3>
                          <ul className="space-y-2">
                            {summary.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Summary Stats</h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                          <BarChart2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Original Length</p>
                          <p className="font-semibold text-gray-900">{summary.originalWordCount.toLocaleString()} words</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                          <BarChart2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Summary Length</p>
                          <p className="font-semibold text-gray-900">{summary.summaryWordCount.toLocaleString()} words</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Time Saved</p>
                          <p className="font-semibold text-gray-900">~{Math.round((summary.originalWordCount - summary.summaryWordCount) / 200)} minutes</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                          <BarChart2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Compression Ratio</p>
                          <p className="font-semibold text-gray-900">{summary.compressionRatio}% shorter</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Share</h3>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center"
                        onClick={() => copyToClipboard(window.location.href, "Link")}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
