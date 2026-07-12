"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function SessionForensics({ auditId }: { auditId: Id<"audits"> }) {
  const sessions = useQuery(api.audits.listSessions, { auditId });

  if (!sessions) return <div className="card">Loading forensics...</div>;

  return (
    <div className="card">
      <h2>Session forensics</h2>
      <table style={{ marginTop: "0.75rem" }}>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Event</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
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
