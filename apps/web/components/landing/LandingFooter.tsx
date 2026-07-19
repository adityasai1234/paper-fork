import Link from "next/link";
import { contactEmail } from "@/lib/site";
import { GITHUB_REPO } from "./data";

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="marketing-container landing-footer-inner">
        <div>
          <p className="landing-footer-brand">Paperfork</p>
          <p>Evidence-led audits and measured research loops.</p>
        </div>
        <nav className="landing-footer-links" aria-label="Footer navigation">
          <Link href="/login">Workspace</Link>
          <Link href="/signup">Waitlist</Link>
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={`mailto:${contactEmail}`}>Contact</a>
        </nav>
      </div>
    </footer>
  );
}
