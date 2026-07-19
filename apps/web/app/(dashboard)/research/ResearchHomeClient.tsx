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
      description="Turn web evidence into measured code experiments. Linkup finds the ideas; Hermes runs the train.py ratchet on your cloud worker."
      activeNav="research"
    >
      <ResumeResearchBanner />
      <ResearchForm />
      <p className="mt-6 font-mono text-xs tracking-wide text-muted">
        prompt · websearch · candidates · cloud experiments · keep or revert
      </p>
      <ReportFooter />
    </AppShell>
  );
}
