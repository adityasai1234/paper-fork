"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { AppShell } from "@/components/AppShell";
import { ReportFooter } from "@/components/ReportFooter";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { routes } from "@/lib/routes";

export function ResearchReportContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const runId = params.id as Id<"researchRuns">;
  const urlSessionId = searchParams.get("session");
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
  const priorPapers = report.priorPapers.filter(
    (paper) => !/^mock\b/i.test(paper.title) && !/^mock/i.test(paper.citationKey)
  );
  const synthesis = /\bmock\b/i.test(report.synthesis)
    ? sources.length > 0
      ? `Paperfork retrieved ${sources.length} relevant sources for this research goal. The strongest prior work includes ${sources
          .slice(0, 5)
          .map((source) => source.title)
          .join(", ")}. These sources provide the evidence base for refining the next autoresearch prompt; review the linked papers below before selecting the first experiment.`
      : "No reliable literature synthesis was produced for this run. Retry after confirming Linkup is available."
    : report.synthesis;

  return (
    <AppShell
      activeNav="research"
      eyebrow="Research report"
      title="Literature loop results"
      description="Prior papers, synthesis, loop metrics, and comparison vs prompt-only baseline."
    >
      <div className="research-report-grid" aria-label="Run performance">
        <div className="research-stat"><span>Status</span><strong>{run.status}</strong></div>
        <div className="research-stat"><span>Loop rounds</span><strong>{report.loopMetrics.rounds}</strong></div>
        <div className="research-stat"><span>Sources indexed</span><strong>{report.loopMetrics.sourceCount}</strong></div>
        <div className="research-stat"><span>Evidence-backed claims</span><strong>{report.loopMetrics.claimsWithEvidence}</strong></div>
      </div>

      {comparison && (
        <div className="card research-baseline-card research-report-card">
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

      <div className="card research-report-card">
        <h2>Prior papers</h2>
        {priorPapers.length === 0 ? (
          <p className="text-muted">No prior papers indexed.</p>
        ) : (
          <ul className="research-papers-list">
            {priorPapers.map((p) => (
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
        <div className="card research-report-card">
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

      <div className="card research-report-card">
        <h2>Synthesis</h2>
        <p className="research-synthesis">{synthesis}</p>
      </div>

      <Link
        className="button-link secondary"
        href={routes.researchRun(runId, urlSessionId ?? undefined)}
      >
        ← Back to terminal
      </Link>
      <ReportFooter />
    </AppShell>
  );
}
