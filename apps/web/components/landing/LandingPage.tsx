import { ReportFooter } from "@/components/ReportFooter";
import { FinalCta } from "./FinalCta";
import { FeatureGrid } from "./FeatureGrid";
import { HowItWorks } from "./HowItWorks";
import { LandingHero } from "./LandingHero";
import { LandingNav } from "./LandingNav";
import { OpenSourceCta } from "./OpenSourceCta";
import { PartnerStrip } from "./PartnerStrip";
import { WorkingNow } from "./WorkingNow";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-ink font-body text-white">
      <LandingNav />
      <main>
        <LandingHero />
        <HowItWorks />
        <FeatureGrid />
        <WorkingNow />
        <OpenSourceCta />
        <PartnerStrip />
        <FinalCta />
        <ReportFooter className="marketing-footer mx-auto max-w-6xl px-6 pb-12" />
      </main>
    </div>
  );
}
