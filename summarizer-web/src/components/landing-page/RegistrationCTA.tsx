import {FC} from "react";
import {Button} from "@/components/ui/button";
import {useLocation} from "wouter";
import {ArrowRight} from "lucide-react";

/**
 * RegistrationCTA component displays call-to-action elements
 * to encourage non-authenticated users to register
 */
const RegistrationCTA: FC = () => {
  const [, setLocation] = useLocation();

  const handleSignUp = () => {
    setLocation("/auth?mode=register");
  };

  return (
    <section
      className="py-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/10 shadow-sm"
      aria-labelledby="cta-heading"
    >
      <div className="text-center max-w-2xl mx-auto px-4">
        <h2
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
          id="cta-heading"
        >
          Ready to Save Hours of Reading Time?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Join thousands of professionals who use ArticleAI to extract insights from content in seconds.
          Create your free account today and start summarizing.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          role="group"
          aria-labelledby="cta-heading"
        >
          <Button
            size="lg"
            onClick={handleSignUp}
            className="w-full sm:w-auto group shadow-md hover:shadow-lg transition-all duration-300"
          >
            Create Free Account
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSignUp}
            className="w-full sm:w-auto hover:bg-primary/5 transition-colors duration-300"
          >
            Learn More
          </Button>
        </div>

        <div className="flex items-center justify-center mt-6 text-sm text-gray-500" aria-live="polite">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <p>No credit card required. Free plan includes 10 summaries per month.</p>
        </div>
      </div>
    </section>
  );
};

export default RegistrationCTA;
