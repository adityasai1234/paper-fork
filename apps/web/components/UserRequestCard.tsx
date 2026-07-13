"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

type UserRequest = {
  _id: Id<"userRequests">;
  type: string;
  status: string;
  reason: string;
  command?: string;
  simulatedOutput?: string;
};

export function UserRequestCard({
  auditId,
  sessionId,
}: {
  auditId: Id<"audits">;
  sessionId?: string;
}) {
  const sessionArgs = sessionId ? { sessionId } : {};
  const requests = useQuery(api.requests.listByAudit, { auditId, ...sessionArgs });
  const approve = useMutation(api.requests.approveRequest);
  const deny = useMutation(api.requests.denyRequest);

  if (!requests?.length) return null;

  return (
    <div className="card">
      <h2>User requests</h2>
      {requests.map((r: UserRequest) => (
        <div key={r._id} className="request-item">
          <p><strong>{r.type}</strong> — {r.status}</p>
          <p>{r.reason}</p>
          {r.command && <pre>{r.command}</pre>}
          {r.simulatedOutput && <pre>{r.simulatedOutput}</pre>}
          {r.status === "pending" && (
            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
              <button onClick={() => approve({ requestId: r._id, ...sessionArgs })}>Approve</button>
              <button className="secondary" onClick={() => deny({ requestId: r._id, ...sessionArgs })}>
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
