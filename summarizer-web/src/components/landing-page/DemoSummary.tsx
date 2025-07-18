import {FC} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {SummarizationResponse} from "@/types/api";

/**
 * DemoSummary component displays a pre-configured example summary
 * to showcase the application's capabilities without requiring user input
 */
const DemoSummary: FC = () => {
  // should typically come from a static file or API endpoint
  const demoSummary: SummarizationResponse = {
    article: {
      title: "The Future of Artificial Intelligence in Content Creation",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, vitae aliquam nisl nunc vitae nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, vitae aliquam nisl nunc vitae nisl...",
      wordCount: 1250,
    },
    summary: {
      content: "AI is revolutionizing content creation by enabling faster production, personalization, and data-driven optimization. While concerns about quality and authenticity exist, the technology continues to improve, promising a future where AI augments human creativity rather than replacing it.",
      keyPoints: [
        "AI tools can generate content 10x faster than human writers",
        "Personalization algorithms tailor content to individual preferences",
        "Data analytics help optimize content performance in real-time",
        "Quality concerns are being addressed through hybrid human-AI workflows",
        "The future points to AI augmentation rather than replacement of creative professionals"
      ],
      wordCount: 125,
      compressionRatio: 90,
    },
  };

  return (
    <section className="py-8" aria-labelledby="demo-summary-heading">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900" id="demo-summary-heading">See ArticleAI in Action</h2>
        <p className="text-gray-600 mt-2">
          Here's an example of how our AI transforms lengthy articles into concise, insightful summaries
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle id="original-article-title">{demoSummary.article.title}</CardTitle>
            <CardDescription>
              <span className="sr-only">Original Article:</span> {demoSummary.article.wordCount} words
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700" aria-labelledby="original-article-title">{demoSummary.article.content}</p>
            <p className="text-gray-500 mt-4 italic">
              (Full article truncated for demonstration)
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle id="ai-summary-title">AI-Generated Summary</CardTitle>
            <CardDescription>
              <span className="sr-only">Summary length:</span> {demoSummary.summary.wordCount} words
              <span aria-hidden="true"> (</span>
              <span className="sr-only">Compression ratio:</span>{demoSummary.summary.compressionRatio}% shorter
              <span aria-hidden="true">)</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 font-medium" aria-labelledby="ai-summary-title">{demoSummary.summary.content}</p>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2" id="key-points-heading">Key Points:</h4>
              <ul
                className="space-y-2"
                aria-labelledby="key-points-heading"
              >
                {demoSummary.summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white rounded-full text-xs mr-2 mt-0.5"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 text-center text-gray-600" aria-live="polite">
        <p>
          <span className="font-semibold">Time saved:</span> ~4 minutes reading time
        </p>
      </div>
    </section>
  );
};

export default DemoSummary;
