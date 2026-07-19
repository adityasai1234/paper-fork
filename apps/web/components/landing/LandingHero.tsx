import Link from "next/link";
import { ForkSignal } from "./ForkSignal";
import { GITHUB_REPO } from "./data";

export function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="marketing-container landing-hero-grid">
        <div className="landing-hero-copy">
          <p className="section-kicker">Open-source research verification</p>
          <h1>Know where the paper and the code parted ways.</h1>
          <p className="landing-hero-description">
            Paperfork compares research claims with repository behavior, keeps every verdict tied
            to evidence, and turns source-backed ideas into measured cloud experiments.
          </p>
          <div className="landing-hero-actions">
            <Link className="ui-button ui-button-primary" href="/login">
              Audit a paper
            </Link>
            <a className="ui-button ui-button-secondary" href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
              Read the source
            </a>
          </div>
          <p className="landing-hero-note">arXiv or DOI + GitHub repository. No black-box verdicts.</p>
        </div>
        <ForkSignal />
      </div>
    </section>
  );
}
