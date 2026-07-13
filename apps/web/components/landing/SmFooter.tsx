import Link from "next/link";
import { GITHUB_REPO } from "./data";

export function SmFinalCta() {
  return (
    <section className="sm-final">
      <div className="sm-container sm-final-inner">
        <h2 className="sm-final-title">
          Your research audit workflow needs its Paperfork
        </h2>
        <Link href="/login" className="sm-btn sm-btn-primary sm-btn-lg">
          Start audit →
        </Link>
        <p className="sm-final-stat">TOTAL FORKS FOUND — live in your workspace</p>
        <a
          href={GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="sm-final-github"
        >
          View on GitHub ↗
        </a>
      </div>
    </section>
  );
}

export function SmFooter() {
  return (
    <footer className="sm-footer">
      <div className="sm-container">
        <div className="sm-footer-grid">
          <div>
            <p className="sm-footer-brand">paperfork</p>
            <p className="sm-footer-tagline">Context infrastructure for research audits.</p>
            <p className="sm-footer-tagline">One API. Every worker. Made for reproducibility.</p>
          </div>
          <div className="sm-footer-col">
            <p className="sm-footer-col-title">Product</p>
            <div className="sm-footer-links sm-footer-links--col">
              <a href="#catalog">Features</a>
              <a href="#pricing">Pricing</a>
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                API
              </a>
            </div>
          </div>
          <div className="sm-footer-col">
            <p className="sm-footer-col-title">Resources</p>
            <div className="sm-footer-links sm-footer-links--col">
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                Documentation
              </a>
              <a href="#faq">FAQ</a>
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
          </div>
          <div className="sm-footer-col">
            <p className="sm-footer-col-title">Company</p>
            <div className="sm-footer-links sm-footer-links--col">
              <Link href="/login">Login</Link>
              <Link href="/signup">Waitlist</Link>
            </div>
          </div>
        </div>
        <div className="sm-footer-bottom">
          <span>© {new Date().getFullYear()} Paperfork</span>
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
            Open source ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
