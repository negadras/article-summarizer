import {FC} from "react";
import HeroSection from "@/components/hero-section";
import DemoSummary from "./DemoSummary";
import PublicShowcase from "./PublicShowcase";
import RegistrationCTA from "./RegistrationCTA";

/**
 * PublicLandingPage component displays the landing page for non-authenticated users
 * It includes a hero section, demo summary, public showcase, and registration CTAs
 */
const PublicLandingPage: FC = () => {
  return (
    <div className="flex flex-col gap-12">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <HeroSection />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <DemoSummary />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <PublicShowcase />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-450">
        <RegistrationCTA />
      </div>
    </div>
  );
};

export default PublicLandingPage;
