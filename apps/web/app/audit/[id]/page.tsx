"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AgentChips } from "@/components/AgentChips";
import { SessionForensics } from "@/components/SessionForensics";
import { ReportFooter } from "@/components/ReportFooter";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export default function AuditPage() {
  const params = useParams();
  const auditId = params.id as Id<"audits">;
  const audit = useQuery(api.audits.getAudit, { auditId });
  const report = useQuery(api.reports.getReport, { auditId });

  if (audit === undefined) {
    return <main><p>Loading audit...</p></main>;
  }

  if (!audit) {
    return <main><p>Audit not found.</p></main>;
  }

  const isComplete = audit.status === "done" || audit.status === "blocked";

  return (
    <main>
      <h1>Audit in progress</h1>
      <p className="subtitle">Status: {audit.status}</p>
      <AgentChips chips={audit.chips} />
      <SessionForensics auditId={auditId} />
      {(isComplete || report) && (
        <p style={{ marginTop: "1rem" }}>
          <Link href={`/report/${auditId}`}>View report</Link>
        </p>
      )}
      <ReportFooter />
    </main>
  );
}
