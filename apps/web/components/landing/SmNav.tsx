import Link from "next/link";
import { GITHUB_REPO } from "./data";

export function SmNav() {
  return (
    <header className="sm-nav">
      <div className="sm-container sm-nav-inner">
        <Link href="/" className="sm-logo no-underline hover:no-underline">
          <span className="sm-logo-mark" aria-hidden>
            ⑂
          </span>
          <span>paperfork</span>
        </Link>
        <nav className="sm-nav-links hidden lg:flex">
          <a href="#catalog">Features</a>
          <a href="#how">How it works</a>
          <a href="#compare">Compare</a>
          <a href="#pricing">Pricing</a>
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
            Docs
          </a>
          <Link href="/signup">Waitlist</Link>
        </nav>
        <div className="sm-nav-actions">
          <Link href="/login" className="sm-btn sm-btn-ghost">
            Login
          </Link>
          <Link href="/login" className="sm-btn sm-btn-primary">
            Start audit →
          </Link>
        </div>
      </div>
    </header>
  );
}
