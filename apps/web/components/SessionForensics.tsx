"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

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
  if (event === "llm_turn") {
    const model = p.model ?? "?";
    const tokens = p.totalTokens ?? p.outputTokens ?? "?";
    const worker = p.worker ?? "";
    const fallback = p.usedFallback ? " [fallback]" : "";
    return `${worker} ${model}${fallback} (${tokens} tokens)`;
  }
  return "";
}

export function SessionForensics({ auditId }: { auditId: Id<"audits"> }) {
  const sessions = useQuery(api.audits.listSessions, { auditId });

  if (!sessions) return <div className="card">Loading forensics...</div>;

  const rulerEvents = sessions.filter((s: SessionEvent) => isRuler(s.agent));
  const workerEvents = sessions.filter((s: SessionEvent) => isWorker(s.agent));
  const llmEvents = sessions.filter((s: SessionEvent) => s.event === "llm_turn");

  return (
    <div className="card">
      <h2>Agent hierarchy forensics</h2>
      <p style={{ color: "#999", fontSize: "0.875rem", marginTop: "0.5rem" }}>
        Ruler delegates workers; workers report up; Ruler speaks via ElevenLabs.
      </p>

      <h3 style={{ marginTop: "1rem", fontSize: "0.95rem" }}>Ruler</h3>
      <table style={{ marginTop: "0.5rem" }}>
        <thead>
          <tr>
            <th>Event</th>
            <th>Detail</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rulerEvents.map((s: SessionEvent) => (
            <tr key={s._id}>
              <td>{s.event}</td>
              <td style={{ color: "#aaa", fontSize: "0.85rem" }}>
                {formatPayload(s.event, s.payload)}
              </td>
              <td>{new Date(s.ts).toLocaleTimeString()}</td>
            </tr>
          ))}
          {rulerEvents.length === 0 && (
            <tr>
              <td colSpan={3} style={{ color: "#666" }}>No ruler events yet</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3 style={{ marginTop: "1rem", fontSize: "0.95rem" }}>Workers</h3>
      <table style={{ marginTop: "0.5rem" }}>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Event</th>
            <th>Detail</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {workerEvents.map((s: SessionEvent) => (
            <tr key={s._id}>
              <td>{s.agent}</td>
              <td>{s.event}</td>
              <td style={{ color: "#aaa", fontSize: "0.85rem" }}>
                {formatPayload(s.event, s.payload)}
              </td>
              <td>{new Date(s.ts).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {llmEvents.length > 0 && (
        <>
          <h3 style={{ marginTop: "1rem", fontSize: "0.95rem" }}>LLM turns (AI Gateway)</h3>
          <table style={{ marginTop: "0.5rem" }}>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Model</th>
                <th>Fallback</th>
                <th>Tokens</th>
                <th>Time</th>
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
        </>
      )}

      <button
        className="secondary"
        style={{ marginTop: "0.75rem" }}
        onClick={() => {
          const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `paperfork-sessions-${auditId}.json`;
          a.click();
        }}
      >
        Export JSON
      </button>
    </div>
  );
}
