import Link from "next/link";
import { PRICING_TIERS } from "./data";

export function SmPricing() {
  return (
    <section id="pricing" className="sm-pricing">
      <div className="sm-container">
        <div className="sm-section-meta sm-section-meta--light">
          <span>〉PRICING</span>
          <span>[8/9]</span>
        </div>
        <h2 className="sm-section-title sm-section-title--light">Simple pricing, by usage.</h2>
        <p className="sm-section-subtitle sm-section-subtitle--light">
          Pay only for what you audit. Every plan includes worker runs — no surprise bills and no
          upgrade walls.
        </p>

        <div className="sm-pricing-grid">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.name}
              className={
                "featured" in tier && tier.featured
                  ? "sm-pricing-card sm-pricing-card--featured"
                  : "sm-pricing-card"
              }
            >
              <h3>{tier.name}</h3>
              <p className="sm-pricing-blurb">{tier.blurb}</p>
              <p className="sm-pricing-price">
                <span>{tier.price}</span>
                <span className="sm-pricing-period">{tier.period}</span>
              </p>
              <Link href={tier.href} className="sm-btn sm-btn-primary sm-pricing-cta">
                {tier.cta}
              </Link>
              <ul>
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="sm-pricing-foot">
          <a href="#faq">See full rate card and FAQ →</a>
        </p>
      </div>
    </section>
  );
}
