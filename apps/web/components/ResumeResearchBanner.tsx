"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

const STORAGE_KEY = "paperfork:activeResearchSession";

type StoredSession = {
  runId: Id<"researchRuns">;
  sessionId: string;
};

export function ResumeResearchBanner({ basePath = "/app" }: { basePath?: string }) {
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

  const run = useQuery(
    api.research.getResearchRun,
    stored ? { runId: stored.runId, sessionId: stored.sessionId } : "skip"
  );

  if (!stored || run === undefined) return null;
  if (!run || (run.status !== "queued" && run.status !== "running")) return null;

  return (
    <div className="card resume-banner">
      <p>Research run in progress — resume the live terminal.</p>
      <Link
        href={`${basePath.replace(/\/$/, "")}/research/${stored.runId}?session=${stored.sessionId}`}
      >
        Resume research
      </Link>
    </div>
  );
}

export function persistActiveResearchSession(runId: Id<"researchRuns">, sessionId: string) {
  const payload: StoredSession = { runId, sessionId };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
