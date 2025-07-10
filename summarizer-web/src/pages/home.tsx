import { useState } from "react";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import InputSection from "@/components/input-section";
import LoadingSection from "@/components/loading-section";
import ResultsSection from "@/components/results-section";
import ErrorSection from "@/components/error-section";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import type { SummarizationResponse } from "@/types/api";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummarizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  const handleExport = () => {
    if (!result) return;
    
    const exportData = {
      title: result.article.title,
      originalContent: result.article.content,
      summary: result.summary.content,
      keyPoints: result.summary.keyPoints,
      stats: {
        originalWords: result.article.wordCount,
        summaryWords: result.summary.wordCount,
        compressionRatio: `${result.summary.compressionRatio}%`
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.article.title || 'article'}-summary.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />
        
        {!result && !isLoading && !error && (
          <InputSection 
            onLoading={setIsLoading}
            onResult={setResult}
            onError={setError}
          />
        )}
        
        {isLoading && <LoadingSection />}
        
        {error && (
          <ErrorSection 
            message={error}
            onRetry={handleReset}
          />
        )}
        
        {result && (
          <>
            <ResultsSection result={result} />
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-12">
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Summarize Another Article
              </Button>
              <Button
                onClick={handleExport}
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Summary
              </Button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
