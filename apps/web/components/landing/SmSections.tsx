import Link from "next/link";
import { GITHUB_REPO } from "./data";

export function SmWhatWeDo() {
  return (
    <section className="sm-what">
      <div className="sm-container">
        <div className="sm-section-meta sm-section-meta--light">
          <span>〉WHAT WE DO</span>
          <span>[2/4]</span>
        </div>
        <h2 className="sm-section-title sm-section-title--light">
          Bring your paper. We find the fork. Your team just knows.
        </h2>
        <p className="sm-section-subtitle sm-section-subtitle--light">
          Research audit infrastructure for AI agents. One workflow, every worker.
        </p>

        <div className="sm-what-grid">
          <Link href="/login" className="sm-what-card no-underline hover:no-underline">
            <p className="sm-what-eyebrow">For researchers & teams</p>
            <h3 className="sm-what-title">The Paperfork app</h3>
            <p className="sm-what-copy">
              Live audits with literature, repo, and web workers. Fork rules, judge synthesis,
              memory recall, and ElevenLabs voice briefs on every report.
            </p>
            <ul className="sm-what-stats">
              <li>6 parallel workers</li>
              <li>Real-time forensics</li>
              <li>Voiced verdict</li>
            </ul>
            <span className="sm-what-cta">Start audit in 5 minutes →</span>
          </Link>

          <Link href="/signup" className="sm-what-card sm-what-card--muted no-underline hover:no-underline">
            <p className="sm-what-eyebrow">For early adopters</p>
            <h3 className="sm-what-title">Waitlist access</h3>
            <p className="sm-what-copy">
              Get notified when full accounts open. Sign in today to run audits with the demo
              workspace.
            </p>
            <ul className="sm-what-stats">
              <li>Convex backend</li>
              <li>Linkup search</li>
              <li>Open source</li>
            </ul>
            <span className="sm-what-cta">Join waitlist →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SmCompare() {
  return (
    <section id="compare" className="sm-compare">
      <div className="sm-container">
        <div className="sm-section-meta sm-section-meta--light">
          <span>〉COMPARE</span>
          <span>[3/4]</span>
        </div>
        <h2 className="sm-section-title sm-section-title--light sm-section-title--center">
          Manual review vs Paperfork
        </h2>

        <div className="sm-compare-grid">
          <div className="sm-compare-card sm-compare-card--legacy">
            <h3>Legacy · manual audit</h3>
            <p>Read the PDF. Skim the repo. Hope you caught the fork.</p>
            <ul>
              <li>Spreadsheets and ad-hoc notes</li>
              <li>No memory across audits</li>
              <li>Retrieval, not verdict</li>
            </ul>
          </div>
          <div className="sm-compare-card sm-compare-card--sm">
            <h3>Paperfork</h3>
            <p>
              Evidence that merges, contradicts, and ships as issues, patches, and voice briefs
              across every session.
            </p>
            <ul>
              <li>Ruler + six specialized workers</li>
              <li>Memory recalls recurring gaps</li>
              <li>One app: audit, report, act</li>
            </ul>
          </div>
        </div>

        <p className="sm-compare-github">
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
            View the open-source repo →
          </a>
        </p>
      </div>
    </section>
  );
}
