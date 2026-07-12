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

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const auditId = params.id as Id<"audits">;
  const sessionId = searchParams.get("session") ?? undefined;
  const sessionArgs = sessionId ? { sessionId } : {};

  const audit = useQuery(api.audits.getAudit, { auditId, ...sessionArgs });
  const report = useQuery(api.reports.getReport, { auditId, ...sessionArgs });
  const githubOutput = useQuery(api.reports.getGithubOutput, { auditId, ...sessionArgs });

  if (!audit || !report) {
    return <main className="loading-state">Loading report…</main>;
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
        <ForkLedger items={report.forkLedger} />
        <NeighborTable neighbors={report.neighbors} />
        <Checklist items={report.checklist} />
        <GapFills items={report.gapFills} />
        <ReproAppendix repro={report.reproAppendix} />
        <VoicePlayer voiceUrl={report.voiceUrl} />
        <UserRequestCard auditId={auditId} sessionId={sessionId} />
        <CronScheduleCard auditId={auditId} githubUrl={audit.githubUrl} sessionId={sessionId} />
      </div>

      {githubOutput && (
        <div className="card">
          <h2>GitHub issue draft</h2>
          {githubOutput.issueUrl && (
            <p><a href={githubOutput.issueUrl}>{githubOutput.issueUrl}</a></p>
          )}
          <pre>{githubOutput.issueBody}</pre>
          <h3 style={{ marginTop: "1rem" }}>README patch</h3>
          <pre>{githubOutput.readmePatch}</pre>
        </div>
      )}

      {report.linkupSources.length > 0 && (
        <div className="card">
          <h2>Linkup sources</h2>
          <ul>
            {report.linkupSources.map((s: { url: string; usedFor: string }, i: number) => (
              <li key={i}>
                <a href={s.url}>{s.usedFor}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ReportFooter />
    </AppShell>
  );
}
