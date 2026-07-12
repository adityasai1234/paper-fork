"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { AppShell } from "@/components/AppShell";
import { ResearchProgress, ResearchTerminal } from "@/components/ResearchTerminal";
import { ReportFooter } from "@/components/ReportFooter";
import { SessionBar } from "@/components/SessionBar";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export function ResearchPageContent({ basePath = "" }: { basePath?: string }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const runId = params.id as Id<"researchRuns">;
  const urlSessionId = searchParams.get("session");
  const prefix = basePath.replace(/\/$/, "");
  const sessionArgs = urlSessionId ? { sessionId: urlSessionId } : {};

  const run = useQuery(api.research.getResearchRun, { runId, ...sessionArgs });

  if (run === undefined) {
    return <main className="loading-state">Loading research run…</main>;
  }

  if (!run) {
    return <main className="loading-state">Research run not found.</main>;
  }

  return (
    <AppShell
      activeNav="research"
      eyebrow="Auto-research loop"
      title="Literature discovery in progress"
      description="Linkup search, citation indexing, synthesis, and evaluation — streamed live below."
    >
      <SessionBar
        auditId={runId}
        resourceType="research"
        sessionId={run.sessionId}
        status={run.status}
        urlSessionId={urlSessionId}
        basePath={prefix}
        label="Research session"
      />
      <div className="audit-demo-grid">
        <ResearchTerminal runId={runId} sessionId={urlSessionId ?? undefined} />
        <ResearchProgress runId={runId} sessionId={urlSessionId ?? undefined} />
      </div>
      {(run.status === "done") && (
        <Link
          className="button-link"
          href={`${prefix}/research/${runId}/report${urlSessionId ? `?session=${urlSessionId}` : ""}`}
        >
          Open research report →
        </Link>
      )}
      <ReportFooter />
    </AppShell>
  );
}
