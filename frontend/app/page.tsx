import Link from "next/link";
import { AuditForm } from "@/components/AuditForm";
import { ReportFooter } from "@/components/ReportFooter";

export default function HomePage() {
  return (
    <main className="marketing">
      <header className="marketing-topbar">
        <span>Paperfork</span>
        <Link href="/signup">Join waitlist</Link>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <p className="marketing-eyebrow">#01 · Audit</p>
        <h1 id="hero-title" className="hero-title">
          Find where the paper
          <br />
          forked from the <em>repo</em>
        </h1>
        <p className="hero-subtitle">Trace where the paper forked from the repo.</p>
      </section>

      <AuditForm />
      <p className="hero-spec">arxiv · github · fork report · voice brief</p>

      <ReportFooter className="marketing-footer" />
    </main>
  );
}
