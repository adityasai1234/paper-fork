"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { routes } from "@/lib/routes";

const STORAGE_KEY = "paperfork:activeSession";

type StoredSession = {
  auditId: Id<"audits">;
};

export function ResumeAuditBanner() {
  const [stored, setStored] = useState<StoredSession | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      setStored(JSON.parse(raw) as StoredSession);
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const audit = useQuery(
    api.audits.getAudit,
    stored ? { auditId: stored.auditId } : "skip"
  );

  if (!stored || audit === undefined) return null;
  if (!audit || (audit.status !== "queued" && audit.status !== "running")) return null;

  return (
    <div className="card resume-banner">
      <p>Audit in progress — resume live hierarchy and pattern stream.</p>
      <Link href={routes.audit(stored.auditId)}>Resume audit</Link>
    </div>
  );
}

export function persistActiveSession(auditId: Id<"audits">) {
  const payload: StoredSession = { auditId };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
