"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AgentChips, type ChipStatus } from "@/components/AgentChips";
import { AppShell } from "@/components/AppShell";
import { SessionForensics } from "@/components/SessionForensics";
import { ReportFooter } from "@/components/ReportFooter";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default function AuditPage() {
  const params = useParams();
  const auditId = params.id as Id<"audits">;
  const audit = useQuery(api.audits.getAudit, { auditId });
  const report = useQuery(api.reports.getReport, { auditId });

  if (audit === undefined) {
    return <main className="loading-state">Loading audit…</main>;
  }

  if (!audit) {
    return <main className="loading-state">Audit not found.</main>;
  }

  const isComplete = audit.status === "done" || audit.status === "blocked";

  return (
    <AppShell
      eyebrow="Live research operation"
      title="Evidence audit in progress"
      description="The Ruler coordinates independent workers and preserves every handoff for review."
    >
      <div className="status-band">
        <strong>Current operation state</strong>
        <span className="status-value">{audit.status}</span>
      </div>
      <AgentChips chips={audit.chips as { literature: ChipStatus; repo: ChipStatus; web: ChipStatus }} />
      <SessionForensics auditId={auditId} />
      {(isComplete || report) && (
        <Link className="button-link" href={`/report/${auditId}`}>Open fork report →</Link>
      )}
      <ReportFooter />
    </AppShell>
  );
}
