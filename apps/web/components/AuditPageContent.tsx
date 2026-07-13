"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { AgentChips, type ChipStatus } from "@/components/AgentChips";
import { AgentHierarchyLive } from "@/components/AgentHierarchyLive";
import { AppShell } from "@/components/AppShell";
import { PatternProgress } from "@/components/PatternProgress";
import { SessionBar } from "@/components/SessionBar";
import { SessionForensics } from "@/components/SessionForensics";
import { ReportFooter } from "@/components/ReportFooter";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { routes } from "@/lib/routes";

export function AuditPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const auditId = params.id as Id<"audits">;
  const urlSessionId = searchParams.get("session");
  const sessionArgs = urlSessionId ? { sessionId: urlSessionId } : {};

  const audit = useQuery(api.audits.getAudit, { auditId, ...sessionArgs });
  const report = useQuery(api.reports.getReport, { auditId, ...sessionArgs });

  if (audit === undefined) {
    return <main className="loading-state">Loading audit…</main>;
  }

  if (!audit) {
    return <main className="loading-state">Audit not found.</main>;
  }

  const isComplete = audit.status === "done" || audit.status === "blocked";

  return (
    <AppShell
      activeNav="audit"
      eyebrow="Live research operation"
      title="Evidence audit in progress"
      description="The Ruler coordinates independent workers. Session URL preserves live hierarchy and pattern progress."
    >
      <SessionBar
        auditId={auditId}
        sessionId={audit.sessionId}
        status={audit.status}
        urlSessionId={urlSessionId}
        resourceType="audit"
      />
      <AgentHierarchyLive auditId={auditId} sessionId={urlSessionId ?? undefined} />
      <div className="audit-demo-grid">
        <PatternProgress auditId={auditId} sessionId={urlSessionId ?? undefined} />
        <AgentChips
          chips={
            audit.chips as {
              literature: ChipStatus;
              repo: ChipStatus;
              web: ChipStatus;
              methods?: ChipStatus;
            }
          }
        />
      </div>
      <details className="card forensics-details" open={!isComplete}>
        <summary>Detailed agent log</summary>
        <SessionForensics auditId={auditId} sessionId={urlSessionId ?? undefined} embedded />
      </details>
      {(isComplete || report) && (
        <Link
          className="button-link"
          href={routes.auditReport(auditId, urlSessionId ?? undefined)}
        >
          Open fork report →
        </Link>
      )}
      <ReportFooter />
    </AppShell>
  );
}
