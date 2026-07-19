"use client";

import { useQuery } from "convex/react";
import { useParams, useSearchParams } from "next/navigation";
import { Checklist } from "@/components/Checklist";
import { AppShell } from "@/components/AppShell";
import { CronScheduleCard } from "@/components/CronScheduleCard";
import { EvalProtocol } from "@/components/EvalProtocol";
import { ForkLedger } from "@/components/ForkLedger";
import { GapFills } from "@/components/GapFills";
import { NeighborTable } from "@/components/NeighborTable";
import { ReproAppendix } from "@/components/ReproAppendix";
import { ReportFooter } from "@/components/ReportFooter";
import { UserRequestCard } from "@/components/UserRequestCard";
import { VoicePlayer } from "@/components/VoicePlayer";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default function AuditReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const auditId = params.id as Id<"audits">;
  const sessionId = searchParams.get("session") ?? undefined;
  const sessionArgs = sessionId ? { sessionId } : {};

  const audit = useQuery(api.audits.getAudit, { auditId, ...sessionArgs });
  const report = useQuery(api.reports.getReport, { auditId, ...sessionArgs });
  const githubOutput = useQuery(api.reports.getGithubOutput, { auditId, ...sessionArgs });
  const pdfUrl = useQuery(api.reports.getReportPdfUrl, { auditId, ...sessionArgs });

  if (!audit || !report) {
    return <main id="main-content" className="loading-state" aria-live="polite">Loading report…</main>;
  }

  return (
    <AppShell
      eyebrow="Evidence ledger"
      title="Fork report"
      description={report.paper.title}
    >
      <div className="report-meta">
        <span>Paper / {report.paper.id}</span>
        <span>Repository / {report.repo.url}</span>
        <span>Commit / {report.repo.sha || "unresolved"}</span>
      </div>

      <div className="report-grid">
        <EvalProtocol protocol={report.evalProtocol} />
        {report.sectionVerification && report.sectionVerification.length > 0 && (
          <div className="card">
            <h2>Section verification</h2>
            <ul className="section-verification-list">
              {report.sectionVerification.map((s) => (
                <li key={s.section} className={`verify-${s.status}`}>
                  <strong>{s.section}</strong>: {s.status}
                  {s.discrepancies.length > 0 && (
                    <ul>
                      {s.discrepancies.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            {pdfUrl && (
              <p className="card-action-row">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  Download verified paper PDF
                </a>
                {report.pdfSource === "arxiv_passthrough" && (
                  <span className="text-muted"> (arXiv source)</span>
                )}
              </p>
            )}
          </div>
        )}
        <ForkLedger items={report.forkLedger} />
        <NeighborTable neighbors={report.neighbors} />
        <Checklist items={report.checklist} />
        <GapFills items={report.gapFills} />
        <ReproAppendix repro={report.reproAppendix} />
        <VoicePlayer voiceUrl={report.voiceUrl} />
        <UserRequestCard auditId={auditId} sessionId={sessionId} />
        <CronScheduleCard auditId={auditId} sessionId={sessionId} />
      </div>

      {githubOutput && (
        <div className="card">
          <h2>GitHub outputs</h2>
          {githubOutput.issueUrl && (
            <p>
              Issue: <a href={githubOutput.issueUrl} target="_blank" rel="noopener noreferrer">{githubOutput.issueUrl}</a>
            </p>
          )}
          {githubOutput.prUrl && (
            <p>
              Pull request: <a href={githubOutput.prUrl} target="_blank" rel="noopener noreferrer">{githubOutput.prUrl}</a>
              {githubOutput.branchName && (
                <span className="text-muted"> (branch {githubOutput.branchName})</span>
              )}
            </p>
          )}
          <h3>Issue body</h3>
          <pre>{githubOutput.issueBody}</pre>
          <h3 className="card-subheading">README patch</h3>
          <pre>{githubOutput.readmePatch}</pre>
        </div>
      )}

      {report.linkupSources.length > 0 && (
        <div className="card">
          <h2>Linkup sources</h2>
          <ul>
            {report.linkupSources.map((s: { url: string; usedFor: string }, i: number) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.usedFor}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ReportFooter />
    </AppShell>
  );
}
