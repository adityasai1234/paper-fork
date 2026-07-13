"use client";

import { ResearchForm } from "@/components/ResearchForm";
import { AppShell } from "@/components/AppShell";
import { ResumeResearchBanner } from "@/components/ResumeResearchBanner";
import { ReportFooter } from "@/components/ReportFooter";

export function ResearchHomeClient() {
  return (
    <AppShell
      eyebrow="#02 · Research"
      title="Auto-research loop"
      description="Submit a research prompt. Linkup discovers prior papers, builds citations, and runs a literature loop — compared against a prompt-only baseline."
      activeNav="research"
    >
      <ResumeResearchBanner />
      <ResearchForm />
      <p className="hero-spec">prompt · linkup · citations · synthesis · baseline</p>
      <ReportFooter className="marketing-footer" />
    </AppShell>
  );
}
