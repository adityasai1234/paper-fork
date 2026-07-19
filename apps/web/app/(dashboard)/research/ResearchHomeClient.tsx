"use client";

import { ResearchForm } from "@/components/ResearchForm";
import { AppShell } from "@/components/AppShell";
import { ResumeResearchBanner } from "@/components/ResumeResearchBanner";
import { ReportFooter } from "@/components/ReportFooter";

export function ResearchHomeClient() {
  return (
    <AppShell
      eyebrow="Evidence-backed experimentation"
      title="Run the research loop"
      description="Start with a research question. Optionally attach a repository so grounded ideas become measured cloud experiments with a keep-or-revert decision."
      activeNav="research"
    >
      <ResumeResearchBanner />
      <ResearchForm />
      <p className="capability-line">
        Websearch <span>·</span> Grounded candidates <span>·</span> Cloud experiments <span>·</span> Keep or revert
      </p>
      <ReportFooter />
    </AppShell>
  );
}
