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
import { SmReveal } from "./SmReveal";
import { SmTestimonials } from "./SmTestimonials";
import { SmUseCases } from "./SmUseCases";

export function LandingPage() {
  return (
    <div className="sm-landing">
      <SmNav />
      <main>
        <SmHero />
        <SmReveal>
          <SmLogoMarquee />
        </SmReveal>
        <SmReveal delay={40}>
          <SmProductCatalog />
        </SmReveal>
        <SmReveal>
          <SmWhatWeDo />
        </SmReveal>
        <SmReveal>
          <SmCompare />
        </SmReveal>
        <SmReveal>
          <SmHowItWorks />
        </SmReveal>
        <SmReveal>
          <SmBenchmarks />
        </SmReveal>
        <SmReveal>
          <SmUseCases />
        </SmReveal>
        <SmReveal>
          <SmEnterprise />
        </SmReveal>
        <SmReveal>
          <SmTestimonials />
        </SmReveal>
        <SmReveal>
          <SmPricing />
        </SmReveal>
        <SmReveal>
          <SmFaq />
        </SmReveal>
        <SmReveal>
          <SmFinalCta />
        </SmReveal>
        <SmFooter />
      </main>
    </div>
  );
}
