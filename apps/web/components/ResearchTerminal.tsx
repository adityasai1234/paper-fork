"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

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

export function ResearchTerminal({
  runId,
  sessionId,
}: {
  runId: Id<"researchRuns">;
  sessionId?: string;
}) {
  const progress = useQuery(api.research.getResearchLiveProgress, {
    runId,
    ...(sessionId ? { sessionId } : {}),
  });
  const streamRef = useRef<HTMLDivElement>(null);

  const isRunning =
    progress?.run.status === "queued" || progress?.run.status === "running";

  useEffect(() => {
    if (!streamRef.current) return;
    streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [progress?.sessions.length, isRunning]);

  if (!progress) {
    return <div className="card">Loading terminal…</div>;
  }

  return (
    <div className="card research-terminal-wrap">
      <div className="research-terminal-header">
        <span className="research-terminal-dot red" />
        <span className="research-terminal-dot amber" />
        <span className="research-terminal-dot green" />
        <span className="research-terminal-title">paperfork — research loop</span>
        <span className="research-terminal-status">{progress.run.status}</span>
      </div>
      <div className="research-terminal" ref={streamRef}>
        {progress.sessions.length === 0 ? (
          <p className="research-terminal-line muted">Waiting for background jobs…</p>
        ) : (
          progress.sessions.map((s) => (
            <pre key={s._id} className="research-terminal-line">
              {formatLine(s.event, s.agent, s.payload, s.ts)}
            </pre>
          ))
        )}
        {isRunning && (
          <p className="research-terminal-line research-terminal-cursor">▌</p>
        )}
      </div>
    </div>
  );
}

export function ResearchProgress({
  runId,
  sessionId,
}: {
  runId: Id<"researchRuns">;
  sessionId?: string;
}) {
  const progress = useQuery(api.research.getResearchLiveProgress, {
    runId,
    ...(sessionId ? { sessionId } : {}),
  });

  if (!progress) return null;

  const steps = ["discover", "cite", "synthesize", "evaluate"] as const;
  const current = progress.run.step;

  return (
    <div className="card research-progress">
      <h2>Loop progress</h2>
      <p className="hierarchy-subtitle">
        Round {progress.run.loopRound + 1} · {progress.sourceCount} sources indexed
      </p>
      <div className="research-step-chips">
        {steps.map((step) => {
          let status = "pending";
          if (current === step) status = "running";
          else if (current && steps.indexOf(step) < steps.indexOf(current)) status = "done";
          if (progress.run.status === "done") status = "done";
          return (
            <span key={step} className={`research-step-chip ${status}`}>
              {step}
            </span>
          );
        })}
      </div>
    </div>
  );
}
