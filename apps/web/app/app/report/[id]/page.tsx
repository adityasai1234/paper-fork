"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { Checklist } from "@/components/Checklist";
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
  const auditId = params.id as Id<"audits">;
  const audit = useQuery(api.audits.getAudit, { auditId });
  const report = useQuery(api.reports.getReport, { auditId });
  const githubOutput = useQuery(api.reports.getGithubOutput, { auditId });

  if (!audit || !report) {
    return <main><p>Loading report...</p></main>;
  }

  return (
    <main>
      <h1>Fork Report</h1>
      <p className="subtitle">{report.paper.title}</p>
      <p style={{ marginBottom: "1rem", color: "#999" }}>{report.repo.url}</p>

      <EvalProtocol protocol={report.evalProtocol} />
      <ForkLedger items={report.forkLedger} />
      <NeighborTable neighbors={report.neighbors} />
      <Checklist items={report.checklist} />
      <GapFills items={report.gapFills} />
      <ReproAppendix repro={report.reproAppendix} />
      <VoicePlayer voiceUrl={report.voiceUrl} />
      <UserRequestCard auditId={auditId} />
      <CronScheduleCard auditId={auditId} githubUrl={audit.githubUrl} />

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
    </main>
  );
}
