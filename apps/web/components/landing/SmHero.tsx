import Link from "next/link";
import { SM_HERO } from "./data";

export function SmHero() {
  return (
    <section className="sm-hero sm-dot-sides">
      <div className="sm-container sm-hero-inner">
        <Link href={SM_HERO.badgeHref} className="sm-badge no-underline hover:no-underline">
          <span className="sm-badge-new">New</span>
          <span>{SM_HERO.badge}</span>
          <span aria-hidden>→</span>
        </Link>

        <h1 className="sm-hero-title">
          {SM_HERO.titleBefore}{" "}
          <span className="sm-hero-icon" aria-hidden>
            ⑂
          </span>{" "}
          {SM_HERO.titleAfter}
        </h1>

        <p className="sm-hero-subtitle">{SM_HERO.subtitle}</p>

        <div className="sm-hero-ctas">
          <Link href="/login" className="sm-btn sm-btn-primary sm-btn-lg">
            {SM_HERO.primaryCta} →
          </Link>
          <a href={SM_HERO.secondaryHref} className="sm-btn sm-btn-secondary sm-btn-lg">
            {SM_HERO.secondaryCta}
          </a>
        </div>

        <div className="sm-command">
          <code>$ {SM_HERO.command}</code>
        </div>

        <Link href={SM_HERO.personalHref} className="sm-hero-personal">
          {SM_HERO.personalCta} ↗
        </Link>
      </div>
    </section>
  );
}
