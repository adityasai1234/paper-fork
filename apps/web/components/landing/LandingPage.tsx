import { SmBenchmarks, SmHowItWorks } from "./SmHowItWorks";
import { SmCompare, SmWhatWeDo } from "./SmSections";
import { SmEnterprise } from "./SmEnterprise";
import { SmFaq } from "./SmFaq";
import { SmFinalCta, SmFooter } from "./SmFooter";
import { SmHero } from "./SmHero";
import { SmLogoMarquee } from "./SmLogoMarquee";
import { SmNav } from "./SmNav";
import { SmPricing } from "./SmPricing";
import { SmProductCatalog } from "./SmProductCatalog";
import { SmTestimonials } from "./SmTestimonials";
import { SmUseCases } from "./SmUseCases";

export function LandingPage() {
  return (
    <div className="sm-landing">
      <SmNav />
      <main>
        <SmHero />
        <SmLogoMarquee />
        <SmProductCatalog />
        <SmWhatWeDo />
        <SmCompare />
        <SmHowItWorks />
        <SmBenchmarks />
        <SmUseCases />
        <SmEnterprise />
        <SmTestimonials />
        <SmPricing />
        <SmFaq />
        <SmFinalCta />
        <SmFooter />
      </main>
    </div>
  );
}
