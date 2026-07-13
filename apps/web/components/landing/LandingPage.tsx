import { ReportFooter } from "@/components/ReportFooter";
import { FinalCta } from "./FinalCta";
import { FeatureGrid } from "./FeatureGrid";
import { LandingHero } from "./LandingHero";
import { PartnerStrip } from "./PartnerStrip";
import { SiteNav } from "@/components/SiteNav";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-ink font-body text-white">
      <SiteNav />
      <main>
        <LandingHero />
        <FeatureGrid />
        <PartnerStrip />
        <FinalCta />
        <ReportFooter className="marketing-footer mx-auto max-w-6xl px-6 pb-12" />
      </main>
    </div>
  );
}
