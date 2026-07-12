"use client";

import { AuditForm } from "@/components/AuditForm";
import { AppShell } from "@/components/AppShell";
import { ResumeAuditBanner } from "@/components/ResumeAuditBanner";
import { ReportFooter } from "@/components/ReportFooter";

export function AuditHomeClient() {
  return (
    <AppShell
      eyebrow="#01 · Audit"
      title="Find the fork"
      description="Submit an arXiv ID or DOI plus a GitHub repo. Paperfork runs literature, repo, web, and methods workers — then judges where the paper diverged from the code."
      activeNav="audit"
    >
      <ResumeAuditBanner basePath="/app" />
      <AuditForm />
      <p className="hero-spec">arxiv · doi · github · fork ledger · voice brief</p>
      <ReportFooter className="marketing-footer" />
    </AppShell>
  );
}
