"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function UserRequestCard({ auditId }: { auditId: Id<"audits"> }) {
  const requests = useQuery(api.requests.listByAudit, { auditId });
  const approve = useMutation(api.requests.approveRequest);
  const deny = useMutation(api.requests.denyRequest);

  if (!requests?.length) return null;

  return (
    <div className="card">
      <h2>User requests</h2>
      {requests.map((r) => (
        <div key={r._id} style={{ marginTop: "1rem", padding: "1rem", background: "#0a0a0a", borderRadius: 6 }}>
          <p><strong>{r.type}</strong> — {r.status}</p>
          <p>{r.reason}</p>
          {r.command && <pre>{r.command}</pre>}
          {r.simulatedOutput && <pre>{r.simulatedOutput}</pre>}
          {r.status === "pending" && (
            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
              <button onClick={() => approve({ requestId: r._id })}>Approve</button>
              <button className="secondary" onClick={() => deny({ requestId: r._id })}>
                Deny
              </button>
            </div>
          )}
          {r.status === "denied" && (
            <p style={{ color: "#f87171", marginTop: "0.5rem" }}>
              Fork remains open — run locally and re-audit
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
