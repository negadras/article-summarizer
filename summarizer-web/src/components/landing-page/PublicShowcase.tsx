import {FC, useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ShowcaseSummary} from "@/types/api";
import {ChevronRight} from "lucide-react";
import {showcaseService} from "@/lib/showcaseService";

/**
 * PublicShowcase component displays a collection of anonymized top summaries
 * to showcase the application's capabilities and intrigue visitors
 */
const PublicShowcase: FC = () => {
  const [showcaseSummaries, setShowcaseSummaries] = useState<ShowcaseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowcaseSummaries = async () => {
      try {
        setIsLoading(true);
        const response = await showcaseService.getShowcaseSummaries({ size: 3 });
        setShowcaseSummaries(response.summaries);
        setError(null);
      } catch (err) {
        setError("Failed to load showcase summaries");
        console.error("Error fetching showcase summaries:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowcaseSummaries();
  }, []);

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900" id="showcase-heading">
            <span className="inline-block bg-primary/10 px-4 py-1 rounded-full text-primary mb-2">Popular</span> Summaries
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Discover how others are using ArticleAI to stay informed and save time with these trending summaries
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6" data-testid="loading-skeleton">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border border-gray-200">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>

                <div className="mb-4">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900" id="showcase-heading">
            <span className="inline-block bg-primary/10 px-4 py-1 rounded-full text-primary mb-2">Popular</span> Summaries
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Discover how others are using ArticleAI to stay informed and save time with these trending summaries
          </p>
        </div>

        <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <p className="mb-4">Unable to load showcase summaries at this time.</p>
            <Button
              variant="outline"
              className="mt-2 shadow-sm hover:shadow transition-all"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900" id="showcase-heading">
          <span className="inline-block bg-primary/10 px-4 py-1 rounded-full text-primary mb-2">Popular</span> Summaries
        </h2>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Discover how others are using ArticleAI to stay informed and save time with these trending summaries
        </p>
      </div>

      <div
        className="grid md:grid-cols-3 gap-6"
        role="region"
        aria-labelledby="showcase-heading"
      >
        {showcaseSummaries.map((summary) => (
          <Card
            key={summary.id}
            className="hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50"
            tabIndex={0}
          >
            <CardHeader>
              <CardTitle className="text-lg">{summary.title}</CardTitle>
              <CardDescription>
                <span className="sr-only">Category:</span> {summary.category}
                <span aria-hidden="true">•</span>
                <span className="sr-only">Compression ratio:</span> {summary.stats.compressionRatio}% shorter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm mb-4">{summary.snippet}</p>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-2" id={`key-points-${summary.id}`}>Key Points:</h4>
                <ul
                  className="space-y-1 text-sm"
                  aria-labelledby={`key-points-${summary.id}`}
                >
                  {summary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-1.5" aria-hidden="true"></span>
                      <span className="text-gray-600">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-gray-500">
                <span><span className="sr-only">Original:</span> {summary.stats.originalWords} words</span>
                <span className="mx-2" aria-hidden="true">•</span>
                <span><span className="sr-only">Summary:</span> {summary.stats.summaryWords} words</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" className="group">
          View More Examples
          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};

export default PublicShowcase;
