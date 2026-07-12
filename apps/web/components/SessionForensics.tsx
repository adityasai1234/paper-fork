"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function isRuler(agent: string) {
  return agent === "ruler";
}

function isWorker(agent: string) {
  return agent.startsWith("worker:");
}

export function SessionForensics({ auditId }: { auditId: Id<"audits"> }) {
  const sessions = useQuery(api.audits.listSessions, { auditId });

  if (!sessions) return <div className="card">Loading forensics...</div>;

  const rulerEvents = sessions.filter((s) => isRuler(s.agent));
  const workerEvents = sessions.filter((s) => isWorker(s.agent));

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
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rulerEvents.map((s) => (
            <tr key={s._id}>
              <td>{s.event}</td>
              <td>{new Date(s.ts).toLocaleTimeString()}</td>
            </tr>
          ))}
          {rulerEvents.length === 0 && (
            <tr>
              <td colSpan={2} style={{ color: "#666" }}>No ruler events yet</td>
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
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {workerEvents.map((s) => (
            <tr key={s._id}>
              <td>{s.agent}</td>
              <td>{s.event}</td>
              <td>{new Date(s.ts).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
