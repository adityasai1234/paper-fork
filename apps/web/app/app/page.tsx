import Link from "next/link";
import { AuditForm } from "@/components/AuditForm";
import { ResumeAuditBanner } from "@/components/ResumeAuditBanner";
import { ReportFooter } from "@/components/ReportFooter";

export default function AppHomePage() {
  return (
    <main className="marketing">
      <header className="marketing-topbar">
        <span>Paperfork</span>
        <Link href="/">Home</Link>
      </header>

      <section className="hero" aria-labelledby="app-title">
        <p className="marketing-eyebrow">#01 · Audit</p>
        <h1 id="app-title" className="hero-title">
          Run an audit
        </h1>
        <p className="hero-subtitle">Submit a paper ID and GitHub repo to start the fork report.</p>
      </section>

      <ResumeAuditBanner basePath="/app" />
      <AuditForm />
      <p className="hero-spec">arxiv · github · fork report · voice brief</p>
      <p className="hero-spec">
        <Link href="/app/research">Or start an auto-research loop →</Link>
      </p>

      <ReportFooter className="marketing-footer" />
    </main>
  );
}
