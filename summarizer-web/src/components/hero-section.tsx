import {useAuth} from "@/hooks/use-auth";
import {Brain, Clock, FileText} from "lucide-react";

interface HeroSectionProps {
  showStats?: boolean;
}

export default function HeroSection({ showStats = true }: HeroSectionProps) {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="text-center mb-12">
      {isAuthenticated ? (
        // Personalized hero for authenticated users
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Welcome back, <span className="text-primary">{user?.username || 'User'}</span>!
        </h2>
      ) : (
        // Value proposition for non-authenticated users
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Transform Articles into <span className="text-primary">Intelligent Summaries</span>
        </h2>
      )}

      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
        Save hours of reading time with AI-powered summaries that capture the essence of any article in seconds.
      </p>

      {showStats && !isAuthenticated && (
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-8">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">80%</p>
              <p className="text-sm text-gray-600">Reading time saved</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">95%</p>
              <p className="text-sm text-gray-600">Key points retained</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">10K+</p>
              <p className="text-sm text-gray-600">Articles summarized daily</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
