"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";

function formatSignal(event: string, payload: unknown): string {
  if (!payload || typeof payload !== "object") return event;
  const p = payload as Record<string, unknown>;
  if (event === "worker_report" && typeof p.summary === "string") return p.summary;
  if (event === "delegate") {
    if (typeof p.action === "string") return `Delegate: ${p.action}`;
    if (Array.isArray(p.workers)) return `Delegate: ${p.workers.join(", ")}`;
  }
  if (event === "start" && typeof p.paperId === "string") return `Started on ${p.paperId}`;
  return event;
}

export function PatternProgress({
  auditId,
  sessionId,
}: {
  auditId: Id<"audits">;
  sessionId?: string;
}) {
  const progress = useQuery(api.audits.getAuditLiveProgress, {
    auditId,
    ...(sessionId ? { sessionId } : {}),
  });
  const streamRef = useRef<HTMLDivElement>(null);

  const isRunning =
    progress?.audit.status === "queued" || progress?.audit.status === "running";

  const liveSignals = (progress?.sessions ?? [])
    .filter(
      (s: { event: string }) =>
        s.event === "worker_report" || s.event === "delegate" || s.event === "start"
    )
    .slice()
    .reverse();

  useEffect(() => {
    if (!isRunning || !streamRef.current) return;
    streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [isRunning, liveSignals.length]);

  if (!progress) {
    return <div className="card">Loading pattern progress…</div>;
  }

  return (
    <div className="card pattern-progress">
      <h2>Pattern progress</h2>
      <p className="hierarchy-subtitle">
        Recurring gaps for <code>{progress.repoOwner}</code> and live worker signals
      </p>

      {progress.recalledPatterns.length > 0 && (
        <section className="pattern-section">
          <h3>Recalled patterns (2+ audits)</h3>
          <ul className="pattern-list">
            {progress.recalledPatterns.map((m: Doc<"memories">) => (
              <li key={m._id}>
                <span className="pattern-occurrences">{m.occurrences}×</span>
                {m.pattern}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="pattern-section">
        <h3>Live signals</h3>
        <div className="pattern-stream" ref={streamRef}>
          {liveSignals.length === 0 ? (
            <p className="pattern-empty">Waiting for worker reports…</p>
          ) : (
            liveSignals.map((s: Doc<"sessions">) => (
              <div key={s._id} className="pattern-signal">
                <span className="pattern-agent">{s.agent}</span>
                <span className="pattern-detail">{formatSignal(s.event, s.payload)}</span>
                <time className="pattern-time">{new Date(s.ts).toLocaleTimeString()}</time>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
