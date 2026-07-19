"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

type SessionEvent = {
  _id: string;
  agent: string;
  event: string;
  payload?: unknown;
  ts: number;
};

function isRuler(agent: string) {
  return agent === "ruler";
}

function isWorker(agent: string) {
  return agent.startsWith("worker:");
}

function formatPayload(event: string, payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const p = payload as Record<string, unknown>;
  if (event === "worker_report" && typeof p.summary === "string") return p.summary;
  if (event === "delegate") {
    if (typeof p.action === "string") return `action: ${p.action}`;
    if (Array.isArray(p.workers)) return `workers: ${p.workers.join(", ")}`;
  }
  if (event === "llm_turn") {
    const model = p.model ?? "?";
    const tokens = p.totalTokens ?? p.outputTokens ?? "?";
    const worker = p.worker ?? "";
    const fallback = p.usedFallback ? " [fallback]" : "";
    return `${worker} ${model}${fallback} (${tokens} tokens)`;
  }
  return "";
}

export function SessionForensics({
  auditId,
  sessionId,
  embedded = false,
}: {
  auditId: Id<"audits">;
  sessionId?: string;
  embedded?: boolean;
}) {
  const sessions = useQuery(api.audits.listSessions, {
    auditId,
    ...(sessionId ? { sessionId } : {}),
  });

  if (!sessions) return <div className="card">Loading forensics...</div>;

  const rulerEvents = sessions.filter((s: SessionEvent) => isRuler(s.agent));
  const workerEvents = sessions.filter((s: SessionEvent) => isWorker(s.agent));
  const llmEvents = sessions.filter((s: SessionEvent) => s.event === "llm_turn");

  const wrapperClass = embedded ? "forensics-embedded" : "card";

  return (
    <div className={wrapperClass}>
      <h2>Agent hierarchy forensics</h2>
      <p className="text-detail">
        Ruler delegates workers; workers report up; Ruler speaks via ElevenLabs.
      </p>

      <h3 className="forensics-heading">Ruler</h3>
      <div className="data-table-scroll">
        <table>
          <caption className="sr-only">Ruler orchestration events</caption>
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">Detail</th>
              <th scope="col">Time</th>
            </tr>
          </thead>
          <tbody>
            {rulerEvents.map((s: SessionEvent) => (
              <tr key={s._id}>
                <td>{s.event}</td>
                <td className="text-detail-sm">
                  {formatPayload(s.event, s.payload)}
                </td>
                <td>{new Date(s.ts).toLocaleTimeString()}</td>
              </tr>
            ))}
            {rulerEvents.length === 0 && (
              <tr>
                <td colSpan={3} className="text-detail-sm">No ruler events yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="forensics-heading">Workers</h3>
      <div className="data-table-scroll">
        <table>
          <caption className="sr-only">Worker events</caption>
          <thead>
            <tr>
              <th scope="col">Agent</th>
              <th scope="col">Event</th>
              <th scope="col">Detail</th>
              <th scope="col">Time</th>
            </tr>
          </thead>
          <tbody>
            {workerEvents.map((s: SessionEvent) => (
              <tr key={s._id}>
                <td>{s.agent}</td>
                <td>{s.event}</td>
                <td className="text-detail-sm">
                  {formatPayload(s.event, s.payload)}
                </td>
                <td>{new Date(s.ts).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {llmEvents.length > 0 && (
        <>
          <h3 className="forensics-heading">LLM turns (AI Gateway)</h3>
          <div className="data-table-scroll">
            <table>
              <caption className="sr-only">Language model calls made during this audit</caption>
              <thead>
                <tr>
                  <th scope="col">Worker</th>
                  <th scope="col">Model</th>
                  <th scope="col">Fallback</th>
                  <th scope="col">Tokens</th>
                  <th scope="col">Time</th>
                </tr>
              </thead>
              <tbody>
                {llmEvents.map((s: SessionEvent & { payload?: unknown }) => {
                  const p = (s.payload ?? {}) as Record<string, unknown>;
                  return (
                    <tr key={s._id}>
                      <td>{String(p.worker ?? s.agent)}</td>
                      <td>{String(p.model ?? "-")}</td>
                      <td>{p.usedFallback ? `yes (${String(p.primaryModel ?? "?")})` : "-"}</td>
                      <td>{String(p.totalTokens ?? "-")}</td>
                      <td>{new Date(s.ts).toLocaleTimeString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <button
        type="button"
        className="secondary"
        onClick={() => {
          const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `paperfork-sessions-${auditId}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        Export JSON
      </button>
    </div>
  );
}
