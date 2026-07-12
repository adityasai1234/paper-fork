"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { AppShell } from "@/components/AppShell";
import { ReportFooter } from "@/components/ReportFooter";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export function ResearchReportContent({ basePath = "" }: { basePath?: string }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const runId = params.id as Id<"researchRuns">;
  const urlSessionId = searchParams.get("session");
  const prefix = basePath.replace(/\/$/, "");
  const sessionArgs = urlSessionId ? { sessionId: urlSessionId } : {};

  const data = useQuery(api.research.getResearchReport, { runId, ...sessionArgs });

  if (data === undefined) {
    return <main className="loading-state">Loading report…</main>;
  }

  if (!data) {
    return <main className="loading-state">Report not ready yet.</main>;
  }

  const { run, report, sources, baselineReport } = data;
  const comparison = report.baselineComparison;

  return (
    <AppShell
      activeNav="research"
      eyebrow="Research report"
      title="Literature loop results"
      description="Prior papers, synthesis, loop metrics, and comparison vs prompt-only baseline."
    >
      <div className="card">
        <h2>Run performance</h2>
        <ul className="research-metrics-list">
          <li>Status: {run.status}</li>
          <li>Loop rounds: {report.loopMetrics.rounds}</li>
          <li>Sources indexed: {report.loopMetrics.sourceCount}</li>
          <li>Evidence-backed claims: {report.loopMetrics.claimsWithEvidence}</li>
          <li>Gaps at finish: {report.loopMetrics.gapCount}</li>
        </ul>
      </div>

      {comparison && (
        <div className="card research-baseline-card">
          <h2>vs prompt-only baseline</h2>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Baseline</th>
                <th>Paperfork research</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sources cited</td>
                <td>{baselineReport?.loopMetrics.sourceCount ?? 0}</td>
                <td>{report.loopMetrics.sourceCount}</td>
              </tr>
              <tr>
                <td>Evidence-backed claims</td>
                <td>{comparison.baselineClaimsWithEvidence}</td>
                <td>{comparison.claimsWithEvidence}</td>
              </tr>
            </tbody>
          </table>
          <p className="research-baseline-summary">{comparison.summary}</p>
        </div>
      )}

      <div className="card">
        <h2>Prior papers</h2>
        {report.priorPapers.length === 0 ? (
          <p className="text-muted">No prior papers indexed.</p>
        ) : (
          <ul className="research-papers-list">
            {report.priorPapers.map((p) => (
              <li key={p.citationKey}>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.title}
                </a>
                <span className="research-citation-key">[{p.citationKey}]</span>
                <span className="research-relevance">{p.relevance}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {sources.length > 0 && (
        <div className="card">
          <h2>All sources</h2>
          <ul className="research-papers-list">
            {sources.map((s) => (
              <li key={s._id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
                <span className="research-citation-key">[{s.citationKey}]</span>
                <span className="text-muted">round {s.round}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2>Synthesis</h2>
        <p className="research-synthesis">{report.synthesis}</p>
      </div>

      <Link
        className="button-link secondary"
        href={`${prefix}/research/${runId}${urlSessionId ? `?session=${urlSessionId}` : ""}`}
      >
        ← Back to terminal
      </Link>
      <ReportFooter />
    </AppShell>
  );
}
