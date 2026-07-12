"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { ChipStatus } from "./AgentChips";

const WORKER_NODES = [
  { id: "literature", label: "Literature", chipKey: "literature" as const },
  { id: "repo", label: "Repo", chipKey: "repo" as const },
  { id: "web", label: "Web", chipKey: "web" as const },
  { id: "methods", label: "Methods", chipKey: "methods" as const },
  { id: "judge", label: "Judge", agent: "worker:judge" },
  { id: "gap-filler", label: "Gap filler", agent: "worker:gap-filler" },
  { id: "eval-scaler", label: "Eval scaler", agent: "worker:eval-scaler" },
];

function chipStatus(
  chips: {
    literature: ChipStatus;
    repo: ChipStatus;
    web: ChipStatus;
    methods?: ChipStatus;
  },
  chipKey: "literature" | "repo" | "web" | "methods"
): ChipStatus {
  if (chipKey === "methods") return chips.methods ?? "pending";
  return chips[chipKey];
}

function agentEventStatus(
  sessions: Array<{ agent: string; event: string }>,
  agent: string
): ChipStatus {
  const events = sessions.filter((s) => s.agent === agent);
  if (events.some((e) => e.event === "error")) return "error";
  if (events.some((e) => e.event === "worker_report" || e.event === "done")) return "done";
  if (events.some((e) => e.event === "start")) return "running";
  return "pending";
}

function lastDelegateSummary(
  sessions: Array<{ agent: string; event: string; payload?: unknown }>
): string {
  const delegates = sessions.filter((s) => s.agent === "ruler" && s.event === "delegate");
  const last = delegates[delegates.length - 1];
  if (!last?.payload || typeof last.payload !== "object") return "Ruler orchestrating workers…";

  const p = last.payload as Record<string, unknown>;
  if (typeof p.action === "string") return `Ruler: ${p.action}`;
  if (Array.isArray(p.workers)) return `Ruler delegated ${p.workers.length} workers`;
  return "Ruler orchestrating workers…";
}

export function AgentHierarchyLive({ auditId }: { auditId: Id<"audits"> }) {
  const audit = useQuery(api.audits.getAudit, { auditId });
  const sessions = useQuery(api.audits.listSessions, { auditId });

  if (!audit || !sessions) {
    return <div className="card">Loading agent hierarchy…</div>;
  }

  const chips = audit.chips as {
    literature: ChipStatus;
    repo: ChipStatus;
    web: ChipStatus;
    methods?: ChipStatus;
  };

  const recentEvent = sessions[sessions.length - 1];
  const flashKey = recentEvent?._id ?? "none";

  return (
    <div className="card hierarchy-live" key={flashKey}>
      <h2>Agent hierarchy</h2>
      <p className="hierarchy-subtitle">{lastDelegateSummary(sessions)}</p>

      <div className="hierarchy-tree">
        <div className={`hierarchy-node ruler-node status-${audit.status}`}>
          <span className="hierarchy-label">Ruler</span>
          <span className="hierarchy-status">{audit.status}</span>
        </div>

        <div className="hierarchy-connector" aria-hidden />

        <div className="hierarchy-workers">
          {WORKER_NODES.map((node) => {
            const status =
              "chipKey" in node && node.chipKey
                ? chipStatus(chips, node.chipKey)
                : agentEventStatus(sessions, node.agent!);

            return (
              <div
                key={node.id}
                className={`hierarchy-node worker-node status-${status} ${status === "running" ? "pulse" : ""}`}
              >
                <span className="hierarchy-label">{node.label}</span>
                <span className="hierarchy-status">{status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
