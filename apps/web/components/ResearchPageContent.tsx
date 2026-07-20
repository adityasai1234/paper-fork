"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { AppShell } from "@/components/AppShell";
import { ResearchProgress } from "@/components/ResearchProgress";
import { ResearchTerminal } from "@/components/ResearchTerminal";
import type { ResearchStepFilter } from "@/components/researchSteps";
import { ReportFooter } from "@/components/ReportFooter";
import { SessionBar } from "@/components/SessionBar";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { routes } from "@/lib/routes";

export function ResearchPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const runId = params.id as Id<"researchRuns">;
  const urlSessionId = searchParams.get("session");
  const sessionArgs = urlSessionId ? { sessionId: urlSessionId } : {};
  const [stepFilter, setStepFilter] = useState<ResearchStepFilter>("all");

  const run = useQuery(api.research.getResearchRun, { runId, ...sessionArgs });
  const live = useQuery(api.research.getResearchLiveProgress, { runId, ...sessionArgs });
  const reportUrl = routes.researchReport(runId, urlSessionId ?? undefined);

  useEffect(() => {
    if (run?.status !== "done") return;
    const redirect = window.setTimeout(() => router.replace(reportUrl), 700);
    return () => window.clearTimeout(redirect);
  }, [reportUrl, router, run?.status]);

  if (run === undefined) {
    return <main id="main-content" className="loading-state" aria-live="polite">Loading research run…</main>;
  }

  if (!run) {
    return <main id="main-content" className="loading-state">Research run not found.</main>;
  }

  const showReportLink = run.status === "done" || live?.reportReady === true;

  return (
    <AppShell
      activeNav="research"
      eyebrow="Auto-research loop"
      title={run.executionConfig ? "Cloud experiments in progress" : "Literature discovery in progress"}
      description={
        run.executionConfig
          ? `Websearch proposes source-backed train.py changes. Hermes measures them against ${run.executionConfig.metricName} and keeps only improvements.`
          : "Linkup search, citation indexing, synthesis, and evaluation — streamed live below."
      }
    >
      <SessionBar
        auditId={runId}
        resourceType="research"
        sessionId={run.sessionId}
        status={run.status}
        urlSessionId={urlSessionId}
        label="Research session"
      />
      {run.status === "failed" && (
        <div className="card form-error" role="alert">
          <p>Research run failed{run.error ? `: ${run.error}` : "."}</p>
          <Link className="button-link" href={routes.research()}>
            Start a new run →
          </Link>
        </div>
      )}
      <div className="audit-demo-grid">
        <ResearchTerminal
          runId={runId}
          sessionId={urlSessionId ?? undefined}
          stepFilter={stepFilter}
        />
        <ResearchProgress
          runId={runId}
          sessionId={urlSessionId ?? undefined}
          activeStep={stepFilter}
          onStepClick={setStepFilter}
        />
      </div>
      {showReportLink && (
        <div className="card" aria-live="polite">
          <p>
            {run.status === "done"
              ? "Research complete. Opening the results page…"
              : "Results are ready."}
          </p>
          <Link className="button-link" href={reportUrl}>
            Open results now →
          </Link>
        </div>
      )}
      <ReportFooter />
    </AppShell>
  );
}
