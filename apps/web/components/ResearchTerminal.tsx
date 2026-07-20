"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { STEP_EVENTS, type ResearchStepFilter } from "@/components/researchSteps";

function formatLine(
  event: string,
  agent: string,
  payload: unknown,
  ts: number
): string {
  const time = new Date(ts).toLocaleTimeString();
  const prefix = `[${time}] [${event}] ${agent}`;

  if (!payload || typeof payload !== "object") return prefix;

  const p = payload as Record<string, unknown>;

  if (event === "discover" && typeof p.query === "string") {
    return `${prefix}\n  → query: ${p.query}`;
  }
  if (event === "tool_call") {
    return `${prefix}\n  → prior papers: ${p.priorPaperCount ?? 0}, sources: ${p.sourceCount ?? 0}`;
  }
  if (event === "cite" && typeof p.message === "string") {
    return `${prefix}\n  → ${p.message}`;
  }
  if (event === "synthesize" && typeof p.synthesisPreview === "string") {
    return `${prefix}\n  → ${p.claimsWithEvidence ?? 0} claims · ${p.synthesisPreview}…`;
  }
  if (event === "experiment") {
    const label = typeof p.title === "string" ? p.title : p.kind ?? "experiment";
    return `${prefix}\n  → ${label}: ${p.state ?? "updated"}${
      p.metricValue !== undefined ? ` · ${p.metricName ?? "metric"} ${p.metricValue}` : ""
    }`;
  }
  if (event === "evaluate") {
    const cont = p.shouldContinue ? "continue" : "finish";
    return `${prefix}\n  → ${cont}: ${p.reasoning ?? ""}`;
  }
  if (event === "llm_turn" && typeof p.model === "string") {
    return `${prefix}\n  → ${p.model} (${p.totalTokens ?? "?"} tokens)`;
  }
  if (event === "error" && typeof p.message === "string") {
    return `${prefix}\n  ✗ ${p.message}`;
  }
  if (event === "done") {
    return `${prefix}\n  ✓ run complete`;
  }
  if (event === "start" && typeof p.prompt === "string") {
    return `${prefix}\n  → ${p.prompt}`;
  }

  return prefix;
}

function sessionMatchesFilter(event: string, filter: ResearchStepFilter): boolean {
  if (filter === "all") return true;
  return STEP_EVENTS[filter].includes(event);
}

export function ResearchTerminal({
  runId,
  sessionId,
  stepFilter = "all",
}: {
  runId: Id<"researchRuns">;
  sessionId?: string;
  stepFilter?: ResearchStepFilter;
}) {
  const progress = useQuery(api.research.getResearchLiveProgress, {
    runId,
    ...(sessionId ? { sessionId } : {}),
  });
  const streamRef = useRef<HTMLDivElement>(null);

  const isRunning =
    progress?.run.status === "queued" || progress?.run.status === "running";

  const visibleSessions =
    progress?.sessions.filter((s) => sessionMatchesFilter(s.event, stepFilter)) ?? [];

  useEffect(() => {
    if (!streamRef.current) return;
    streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [visibleSessions.length, isRunning, stepFilter]);

  if (!progress) {
    return <div className="card">Loading terminal…</div>;
  }

  return (
    <div className="card research-terminal-wrap">
      <div className="research-terminal-header">
        <span className="research-terminal-dot red" aria-hidden="true" />
        <span className="research-terminal-dot amber" aria-hidden="true" />
        <span className="research-terminal-dot green" aria-hidden="true" />
        <span className="research-terminal-title">paperfork — research loop</span>
        <span className="research-terminal-status">{progress.run.status}</span>
      </div>
      <div className="research-terminal" ref={streamRef} role="log" aria-live="polite" aria-relevant="additions text">
        {visibleSessions.length === 0 ? (
          <p className="research-terminal-line muted">
            {stepFilter === "all"
              ? "Waiting for background jobs…"
              : `No ${stepFilter} events yet — try another step or show all.`}
          </p>
        ) : (
          visibleSessions.map((s) => (
            <pre key={s._id} className="research-terminal-line">
              {formatLine(s.event, s.agent, s.payload, s.ts)}
            </pre>
          ))
        )}
        {isRunning && stepFilter === "all" && (
          <p className="research-terminal-line research-terminal-cursor">▌</p>
        )}
      </div>
    </div>
  );
}
