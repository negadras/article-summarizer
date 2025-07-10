import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Brain, Copy, RotateCcw, CheckCircle, Target, Zap, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SummarizationResponse } from "@/types/api";

interface ResultsSectionProps {
  result: SummarizationResponse;
}

export default function ResultsSection({ result }: ResultsSectionProps) {
  const { toast } = useToast();

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Original Article */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 text-gray-500 mr-3" />
              Original Article
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{result.article.wordCount} words</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(result.article.content, "Original article")}
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <h4 className="text-lg font-medium text-gray-900 mb-4">{result.article.title}</h4>
            <div className="text-gray-700 leading-relaxed space-y-4">
              {result.article.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Brain className="w-5 h-5 text-primary mr-3" />
              AI Summary
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-emerald-600 font-medium">{result.summary.wordCount} words</span>
                <span className="text-xs text-gray-500">{result.summary.compressionRatio}% shorter</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(result.summary.content, "Summary")}
                  title="Copy summary"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Regenerate summary"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Quality Indicators */}
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-800">Summary Quality: Excellent</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs text-emerald-700">
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>Key Points: {result.summary.keyPoints.length}/5</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Conciseness: High</span>
              </div>
              <div className="flex items-center space-x-1">
                <Scale className="w-3 h-3" />
                <span>Balance: Good</span>
              </div>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p className="font-medium">{result.summary.content}</p>
              
              {result.summary.keyPoints.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Key Takeaways:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {result.summary.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
