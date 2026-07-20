"use client";

import { AuditForm } from "@/components/AuditForm";
import { AppShell } from "@/components/AppShell";
import { ResumeAuditBanner } from "@/components/ResumeAuditBanner";
import { ReportFooter } from "@/components/ReportFooter";

export function AuditHomeClient() {
  return (
    <AppShell
      eyebrow="Paper-to-code audit"
      title="Find the reproducibility gap"
      description="Give Paperfork an arXiv ID or DOI and its GitHub repository. The report ties every mismatch to a paper claim and a code path."
      activeNav="audit"
    >
      <ResumeAuditBanner />
      <AuditForm />
      <p className="capability-line">
        arXiv or DOI <span>·</span> GitHub evidence <span>·</span> Fork ledger <span>·</span> Voice brief
      </p>
      <ReportFooter />
    </AppShell>
  );
}
