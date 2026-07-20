import { EvidenceLedgerSection } from "./EvidenceLedgerSection";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { MarketingNav } from "./MarketingNav";
import { ProductPaths } from "./ProductPaths";
import { ResearchLoopSection } from "./ResearchLoopSection";

export function LandingPage() {
  return (
    <div className="marketing-shell">
      <MarketingNav />
      <main id="main-content" className="marketing-main">
        <LandingHero />
        <ProductPaths />
        <ResearchLoopSection />
        <EvidenceLedgerSection />
      </main>
      <LandingFooter />
    </div>
  );
}
