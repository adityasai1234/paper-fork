import { ReportFooter } from "@/components/ReportFooter";
import { FinalCta } from "./FinalCta";
import { FeatureGrid } from "./FeatureGrid";
import { LandingHero } from "./LandingHero";
import { LandingNav } from "./LandingNav";
import { PartnerStrip } from "./PartnerStrip";

export function LandingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[720px] px-6 pb-12 pt-[min(8vh,4rem)] font-body text-white">
      <LandingNav />
      <LandingHero />
      <FeatureGrid />
      <PartnerStrip />
      <FinalCta />
      <ReportFooter className="marketing-footer" />
    </main>
  );
}
