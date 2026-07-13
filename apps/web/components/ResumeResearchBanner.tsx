"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { routes } from "@/lib/routes";

const STORAGE_KEY = "paperfork:activeResearchSession";

type StoredSession = {
  runId: Id<"researchRuns">;
};

export function ResumeResearchBanner() {
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
    stored ? { runId: stored.runId } : "skip"
  );

  if (!stored || run === undefined) return null;
  if (!run || (run.status !== "queued" && run.status !== "running")) return null;

  return (
    <div className="card resume-banner">
      <p>Research run in progress — resume the live terminal.</p>
      <Link href={routes.researchRun(stored.runId)}>Resume research</Link>
    </div>
  );
}

export function persistActiveResearchSession(runId: Id<"researchRuns">) {
  const payload: StoredSession = { runId };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
