"use client";

import Link from "next/link";
import { ResearchForm } from "@/components/ResearchForm";
import { ResumeResearchBanner } from "@/components/ResumeResearchBanner";
import { ReportFooter } from "@/components/ReportFooter";

export function ResearchHomeClient() {
  return (
    <main className="marketing">
      <header className="marketing-topbar">
        <span>Paperfork</span>
        <nav className="marketing-topbar-nav">
          <Link href="/app">Audit</Link>
          <Link href="/">Home</Link>
        </nav>
      </header>

      <section className="hero" aria-labelledby="research-title">
        <p className="marketing-eyebrow">#02 · Research</p>
        <h1 id="research-title" className="hero-title">
          Auto-research loop
        </h1>
        <p className="hero-subtitle">
          Submit a research prompt. Linkup discovers prior papers, builds citations, and runs a
          literature loop — compared against a prompt-only baseline.
        </p>
      </section>

      <ResumeResearchBanner basePath="/app" />
      <ResearchForm />
      <p className="hero-spec">prompt · linkup · citations · synthesis · baseline</p>

      <ReportFooter className="marketing-footer" />
    </main>
  );
}
